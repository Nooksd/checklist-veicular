package controllers

import (
	"context"
	"net/http"
	database "server/src/db"
	helper "server/src/helpers"
	model "server/src/models"
	"time"

	"github.com/gin-gonic/gin"
	ua "github.com/mileusna/useragent"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var fuelCollection *mongo.Collection = database.OpenCollection(database.Client, "fuels")
var carEntryCollection *mongo.Collection = database.OpenCollection(database.Client, "carEntries")

func deviceType(ua ua.UserAgent) string {
	if ua.Mobile {
		return "Mobile"
	}
	if ua.Tablet {
		return "Tablet"
	}
	if ua.Desktop {
		return "Desktop"
	}
	if ua.Bot {
		return "Bot"
	}
	return "Unknown"
}

func StartCarEntry() gin.HandlerFunc {
	return func(c *gin.Context) {
		var carEntry model.CarEntry
		if err := c.ShouldBindJSON(&carEntry); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
			return
		}

		userAgent := c.GetHeader("User-Agent")
		uaParsed := ua.Parse(userAgent)

		carEntry.ID = primitive.NewObjectID()
		carEntry.DeviceInfo = model.DeviceInfo{
			UserAgent:  userAgent,
			IPAddress:  c.ClientIP(),
			OS:         uaParsed.OS,
			DeviceType: deviceType(uaParsed),
			Browser:    uaParsed.Name,
		}
		carEntry.StartedAt = time.Now()

		validationErrors := validate.Struct(carEntry)
		if validationErrors != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": validationErrors.Error()})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		_, err := carEntryCollection.InsertOne(ctx, carEntry)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar entrada de carro"})
			return
		}

		c.JSON(http.StatusCreated, carEntry)

	}
}
func EndCarEntry() gin.HandlerFunc {
	return func(c *gin.Context) {
		type EndCarEntryInput struct {
			CarID    primitive.ObjectID `json:"carID" binding:"required"`
			UserID   primitive.ObjectID `json:"userID" binding:"required"`
			CheckOut model.CheckOut     `json:"checkOut" binding:"required"`
		}

		var input EndCarEntryInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		filter := bson.M{
			"carID":    input.CarID,
			"userID":   input.UserID,
			"checkOut": nil,
		}
		opts := options.FindOne().SetSort(bson.D{{Key: "createdAt", Value: -1}})
		var carEntry model.CarEntry
		err := carEntryCollection.FindOne(ctx, filter, opts).Decode(&carEntry)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Nenhum check-in pendente encontrado"})
			return
		}

		kmDriven := input.CheckOut.ActualKM - carEntry.CheckIn.ActualKM
		if kmDriven < 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "KM final inferior ao KM inicial"})
			return
		}

		update := bson.M{
			"$set": bson.M{
				"checkOut": input.CheckOut,
				"endedAt":  time.Now(),
				"kmDriven": kmDriven,
			},
		}

		var car model.Car
		err = carCollection.FindOne(ctx, bson.M{"_id": input.CarID}).Decode(&car)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar dados do carro"})
			return
		}

		var lastFuel model.Fuel
		fuelFilter := bson.M{"carID": input.CarID}
		fuelOpts := options.FindOne().SetSort(bson.D{{Key: "createdAt", Value: -1}})
		err = fuelCollection.FindOne(ctx, fuelFilter, fuelOpts).Decode(&lastFuel)
		previousFuel := 0.0
		if err == nil {
			previousFuel = lastFuel.NewFuel
		}

		fuelSpent := kmDriven / float64(car.Consumption)
		newFuel := previousFuel - fuelSpent

		fuelRecord := model.Fuel{
			ID:          primitive.NewObjectID(),
			CarID:       input.CarID,
			PreviusFuel: previousFuel,
			NewFuel:     newFuel,
			KMDriven:    kmDriven,
			CreatedAt:   time.Now(),
		}

		_, err = fuelCollection.InsertOne(ctx, fuelRecord)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar registro de fuel"})
			return
		}

		err = carEntryCollection.FindOneAndUpdate(ctx, filter, update).Decode(&carEntry)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar check-out"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message":    "Check-out registrado com sucesso",
			"kmDriven":   kmDriven,
			"fuelRecord": fuelRecord,
		})

	}
}

func FuelEntry() gin.HandlerFunc {
	return func(c *gin.Context) {
		type FuelEntryInput struct {
			CarID     primitive.ObjectID `json:"carId" binding:"required"`
			FuelAdded float64            `json:"fuelAdded" binding:"required"`
		}

		var input FuelEntryInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var lastFuel model.Fuel
		fuelFilter := bson.M{"carID": input.CarID}
		fuelOpts := options.FindOne().SetSort(bson.D{{Key: "createdAt", Value: -1}})
		err := fuelCollection.FindOne(ctx, fuelFilter, fuelOpts).Decode(&lastFuel)
		previousFuel := 0.0
		if err == nil {
			previousFuel = lastFuel.NewFuel
		}

		newFuel := previousFuel + input.FuelAdded

		fuelRecord := model.Fuel{
			ID:          primitive.NewObjectID(),
			CarID:       input.CarID,
			PreviusFuel: previousFuel,
			NewFuel:     newFuel,
			KMDriven:    0,
			CreatedAt:   time.Now(),
		}

		_, err = fuelCollection.InsertOne(ctx, fuelRecord)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao registrar abastecimento"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message":    "Abastecimento registrado com sucesso",
			"fuelRecord": fuelRecord,
		})
	}
}

func GetCarEntry() gin.HandlerFunc {
	return func(c *gin.Context) {
		if ok, _, _ := helper.CheckAdminOrUidPermission(c, ""); !ok {
			return
		}

		entryID := c.Param("entryId")
		objectID, err := primitive.ObjectIDFromHex(entryID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var carEntry model.CarEntry
		err = carEntryCollection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&carEntry)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Entrada de carro não encontrado"})
			return
		}

		c.JSON(http.StatusOK, carEntry)
	}
}
func GetCarEntrys() gin.HandlerFunc {
	return func(c *gin.Context) {
		if ok, _, _ := helper.CheckAdminOrUidPermission(c, ""); !ok {
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var carEntries []model.CarEntry
		cursor, err := carEntryCollection.Find(ctx, bson.M{})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar entradas de carro"})
			return
		}
		defer cursor.Close(ctx)

		for cursor.Next(ctx) {
			var carEntry model.CarEntry
			cursor.Decode(&carEntry)
			carEntries = append(carEntries, carEntry)
		}

		c.JSON(http.StatusOK, carEntries)
	}
}
func DeleteCarEntry() gin.HandlerFunc {
	return func(c *gin.Context) {
		if ok, _, _ := helper.CheckAdminOrUidPermission(c, ""); !ok {
			return
		}

		entryID := c.Param("entryId")
		objectID, err := primitive.ObjectIDFromHex(entryID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var carEntry model.CarEntry
		err = carEntryCollection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&carEntry)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Entrada de carro não encontrada"})
			return
		}

		if carEntry.KMDriven == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Entrada de carro não possui kmDriven para cálculo de fuel"})
			return
		}
		kmDriven := *carEntry.KMDriven

		var car model.Car
		err = carCollection.FindOne(ctx, bson.M{"_id": carEntry.CarID}).Decode(&car)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar dados do carro"})
			return
		}

		fuelSpent := kmDriven / float64(car.Consumption)

		var lastFuel model.Fuel
		fuelFilter := bson.M{"carID": carEntry.CarID}
		fuelOpts := options.FindOne().SetSort(bson.D{{Key: "createdAt", Value: -1}})
		err = fuelCollection.FindOne(ctx, fuelFilter, fuelOpts).Decode(&lastFuel)
		previousFuel := 0.0
		if err == nil {
			previousFuel = lastFuel.NewFuel
		}

		newFuel := previousFuel + fuelSpent

		fuelRecord := model.Fuel{
			ID:          primitive.NewObjectID(),
			CarID:       carEntry.CarID,
			PreviusFuel: previousFuel,
			NewFuel:     newFuel,
			KMDriven:    0,
			CreatedAt:   time.Now(),
		}

		_, err = fuelCollection.InsertOne(ctx, fuelRecord)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar registro de fuel para ajuste"})
			return
		}

		result, err := carEntryCollection.DeleteOne(ctx, bson.M{"_id": objectID})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao deletar entrada de carro"})
			return
		}
		if result.DeletedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Entrada de carro não encontrada"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message":    "Entrada de carro deletada com ajuste de fuel",
			"fuelRecord": fuelRecord,
			"id":         entryID,
		})
	}
}
