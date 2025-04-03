package controllers

import (
	"context"
	"net/http"
	helper "server/src/helpers"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

func GetStatistics() gin.HandlerFunc {
	return func(c *gin.Context) {

		if ok, _, _ := helper.CheckAdminOrUidPermission(c, ""); !ok {
			c.JSON(http.StatusForbidden, gin.H{"error": "Permissão negada"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		userCount, err := userCollection.CountDocuments(ctx, bson.M{"isActive": true})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao contar usuários"})
			return
		}

		carEntryCount, err := carEntryCollection.CountDocuments(ctx, bson.M{})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao contar entradas de carros"})
			return
		}

		carCount, err := carCollection.CountDocuments(ctx, bson.M{"isActive": true})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao contar carros"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"userCount":     userCount,
			"carEntryCount": carEntryCount,
			"carCount":      carCount,
		})
	}
}
