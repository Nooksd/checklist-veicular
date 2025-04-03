package controllers

import (
	"context"
	"net/http"
	"time"

	helper "server/src/helpers"
	model "server/src/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/crypto/bcrypt"
)

func HashPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	if err != nil {
		return "", err
	}
	return string(hashedPassword), nil
}

func CreateUser() gin.HandlerFunc {
	return func(c *gin.Context) {
		if ok, _, _ := helper.CheckAdminOrUidPermission(c, ""); !ok {
			return
		}

		var user model.User
		if err := c.ShouldBindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if len(user.Password) < 5 || len(user.Password) > 60 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Senha inválida"})
			return
		}

		count, err := userCollection.CountDocuments(context.Background(), bson.M{"email": user.Email})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if count > 0 {
			c.JSON(http.StatusConflict, gin.H{"error": "usuário já existe"})
			return
		}

		newPassword, err := HashPassword(user.Password)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		user.ID = primitive.NewObjectID()
		user.IsActive = true
		user.Password = newPassword
		if user.UserType != "ADMIN" && user.UserType != "USER" {
			user.UserType = "USER"
		}

		validationErrors := validate.Struct(user)
		if validationErrors != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": validationErrors.Error()})
			return
		}

		_, err = userCollection.InsertOne(context.Background(), user)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"message": "Usuário criado com sucesso"})
	}
}

func GetUser() gin.HandlerFunc {
	return func(c *gin.Context) {
		if ok, _, _ := helper.CheckAdminOrUidPermission(c, ""); !ok {
			return
		}

		userId := c.Param("userId")

		var user model.User

		objectId, err := primitive.ObjectIDFromHex(userId)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
			return
		}

		err = userCollection.FindOne(context.Background(), bson.M{"_id": objectId}).Decode(&user)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "usuário não encontrado", "erro": err.Error()})
			return
		}

		user.Password = ""

		c.JSON(http.StatusOK, user)
	}
}

func GetUsers() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		search := c.Query("search")
		isActive := c.Query("active")

		searchFilter := bson.M{}
		if search != "" {
			searchFilter["$or"] = []bson.M{
				{"name": bson.M{"$regex": search, "$options": "i"}},
				{"cnh": bson.M{"$regex": search, "$options": "i"}},
				{"email": bson.M{"$regex": search, "$options": "i"}},
			}
		}

		active := true
		if isActive == "false" {
			active = false
		}
		searchFilter["isActive"] = active

		var users []model.User
		cursor, err := userCollection.Find(ctx, searchFilter)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar usuários"})
			return
		}
		defer cursor.Close(ctx)

		for cursor.Next(ctx) {
			var user model.User
			cursor.Decode(&user)
			user.Password = ""
			users = append(users, user)
		}
		if err = cursor.Err(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar usuários"})
			return
		}

		c.JSON(http.StatusOK, users)
	}
}

func UpdateUser() gin.HandlerFunc {
	return func(c *gin.Context) {
		if ok, _, _ := helper.CheckAdminOrUidPermission(c, ""); !ok {
			return
		}

		userId := c.Param("userId")
		objectId, err := primitive.ObjectIDFromHex(userId)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
			return
		}

		var userUpdates bson.M
		if err := c.BindJSON(&userUpdates); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Erro ao ler os dados de atualização"})
			return
		}

		delete(userUpdates, "id")
		delete(userUpdates, "_id")

		if userUpdates["password"] != nil {
			passStr, ok := userUpdates["password"].(string)

			if !ok || len(passStr) < 5 || len(passStr) > 60 {
				delete(userUpdates, "password")
			} else {
				newPassword, err := HashPassword(passStr)
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
					return
				}
				userUpdates["password"] = newPassword
			}

		}

		if userUpdates["userType"] != nil {
			if userType, ok := userUpdates["userType"].(string); ok {
				if userType != "ADMIN" && userType != "USER" {
					delete(userUpdates, "userType")
				}
			} else {
				delete(userUpdates, "userType")
			}
		}

		filter := bson.M{"_id": objectId}
		update := bson.M{"$set": userUpdates}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		opts := options.FindOneAndUpdate().SetReturnDocument(options.After)

		var updatedUser model.User
		err = userCollection.FindOneAndUpdate(ctx, filter, update, opts).Decode(&updatedUser)
		if err != nil {
			if err == mongo.ErrNoDocuments {
				c.JSON(http.StatusNotFound, gin.H{"error": "Usuário não encontrado"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar os dados do usuário"})
			}
			return
		}

		updatedUser.Password = ""

		c.JSON(http.StatusOK, updatedUser)
	}
}

func DeleteUser() gin.HandlerFunc {
	return func(c *gin.Context) {
		if ok, _, _ := helper.CheckAdminOrUidPermission(c, ""); !ok {
			return
		}

		userId := c.Param("userId")
		objectId, err := primitive.ObjectIDFromHex(userId)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
			return
		}

		result, err := userCollection.DeleteOne(context.Background(), bson.M{"_id": objectId})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao deletar o usuário"})
			return
		}

		if result.DeletedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Usuário não encontrado"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Usuário deletado com sucesso",
		})
	}
}

func DisableUser() gin.HandlerFunc {
	return func(c *gin.Context) {
		if ok, _, _ := helper.CheckAdminOrUidPermission(c, ""); !ok {
			return
		}

		userID := c.Param("userId")
		objectID, err := primitive.ObjectIDFromHex(userID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		result, err := userCollection.UpdateOne(ctx, bson.M{"_id": objectID}, bson.M{"$set": bson.M{"isActive": false}})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao desativar usuário"})
			return
		}
		if result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Usuário não encontrado"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Usuário desativado com sucesso", "id": userID})
	}
}

func EnableUser() gin.HandlerFunc {
	return func(c *gin.Context) {
		if ok, _, _ := helper.CheckAdminOrUidPermission(c, ""); !ok {
			return
		}

		userID := c.Param("userId")
		objectID, err := primitive.ObjectIDFromHex(userID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		result, err := userCollection.UpdateOne(ctx, bson.M{"_id": objectID}, bson.M{"$set": bson.M{"isActive": true}})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao ativar usuário"})
			return
		}
		if result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Usuário não encontrado"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Usuário ativado com sucesso", "id": userID})
	}
}

func GetCurrentUser() gin.HandlerFunc {
	return func(c *gin.Context) {
		var userId string
		if ok, _, userID := helper.CheckAdminOrUidPermission(c, ""); !ok {
			return
		} else {
			userId = userID
		}

		objectID, err := primitive.ObjectIDFromHex(userId)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var user model.User

		err = userCollection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&user)
		if err != nil {
			if err == mongo.ErrNoDocuments {
				c.JSON(http.StatusNotFound, gin.H{"error": "Usuário nao encontrado"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar usuário"})
			}
		}

		c.JSON(http.StatusOK, user)
	}
}
