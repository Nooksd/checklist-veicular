package controllers

import (
	"context"
	"net/http"
	helper "server/src/helpers"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func GetStatistics() gin.HandlerFunc {
	return func(c *gin.Context) {
		if ok, _, _ := helper.CheckAdminOrUidPermission(c, ""); !ok {
			c.JSON(http.StatusForbidden, gin.H{"error": "Permissão negada"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
		defer cancel()

		userCount, err := userCollection.CountDocuments(ctx, bson.M{"isActive": true})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao contar usuários"})
			return
		}
		carEntryCount, err := carEntryCollection.CountDocuments(ctx, bson.M{})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao contar entradas de carro"})
			return
		}
		carCount, err := carCollection.CountDocuments(ctx, bson.M{"isActive": true})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao contar carros"})
			return
		}

		pipeline := mongo.Pipeline{
			{{Key: "$match", Value: bson.M{"isActive": true}}},
			{{
				Key: "$lookup", Value: bson.M{
					"from": "fuels",
					"let":  bson.M{"carId": "$_id"},
					"pipeline": []bson.M{
						{
							"$match": bson.M{
								"$expr": bson.M{
									"$and": []bson.M{
										{"$eq": []interface{}{"$carID", "$$carId"}},
										{"$eq": []interface{}{"$KMDriven", 0}},
									},
								},
							},
						},
						{"$sort": bson.M{"createdAt": -1}},
						{"$limit": 1},
					},
					"as": "lastRefuel",
				},
			}},
			{{
				Key: "$lookup", Value: bson.M{
					"from": "fuels",
					"let":  bson.M{"carId": "$_id"},
					"pipeline": []bson.M{
						{
							"$match": bson.M{
								"$expr": bson.M{"$eq": []interface{}{"$carID", "$$carId"}},
							},
						},
						{"$sort": bson.M{"createdAt": -1}},
						{"$limit": 1},
					},
					"as": "lastFuel",
				},
			}},
			{{
				Key: "$lookup", Value: bson.M{
					"from": "carEntries",
					"let":  bson.M{"carId": "$_id"},
					"pipeline": []bson.M{
						{
							"$match": bson.M{
								"$expr": bson.M{"$eq": []interface{}{"$carID", "$$carId"}},
							},
						},
						{"$sort": bson.M{"startedAt": -1}},
						{"$limit": 1},
					},
					"as": "lastCarEntry",
				},
			}},
			{{
				Key: "$project", Value: bson.M{
					"_id":         1,
					"number":      1,
					"plate":       1,
					"model":       1,
					"brand":       1,
					"year":        1,
					"isActive":    1,
					"capacity":    1,
					"consumption": 1,
					"lastRefuelCreatedAt": bson.M{
						"$arrayElemAt": []interface{}{"$lastRefuel.createdAt", 0},
					},
					"currentFuel": bson.M{
						"$arrayElemAt": []interface{}{"$lastFuel.currentFuel", 0},
					},
					"checkout": bson.M{
						"$arrayElemAt": []interface{}{"$lastCarEntry.checkOut", 0},
					},
				},
			}},
		}

		cursor, err := carCollection.Aggregate(ctx, pipeline)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro na agregação dos carros"})
			return
		}
		defer cursor.Close(ctx)

		var cars []bson.M
		if err = cursor.All(ctx, &cars); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao ler os resultados da agregação"})
			return
		}

		c.JSON(http.StatusOK, bson.M{
			"userCount":     userCount,
			"carEntryCount": carEntryCount,
			"carCount":      carCount,
			"cars":          cars,
		})
	}
}
