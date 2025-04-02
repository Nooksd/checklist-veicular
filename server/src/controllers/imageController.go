package controllers

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"

	model "server/src/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func ensureDir(dirName string) error {
	err := os.MkdirAll(dirName, 0755)
	if err != nil {
		return fmt.Errorf("não foi possível criar pasta %s: %v", dirName, err)
	}
	return nil
}

func uploadImages(c *gin.Context, entryID, subfolder string) ([]string, error) {
	form, err := c.MultipartForm()
	if err != nil {
		return nil, fmt.Errorf("erro ao ler formulário: %v", err)
	}

	files := form.File["images"]
	if len(files) == 0 {
		return nil, fmt.Errorf("nenhuma imagem enviada")
	}
	if len(files) > 5 {
		return nil, fmt.Errorf("máximo de 5 imagens permitido")
	}

	basePath := "uploads"
	entryPath := filepath.Join(basePath, entryID, subfolder)

	if err := ensureDir(entryPath); err != nil {
		return nil, fmt.Errorf("falha ao criar pasta de %s: %v", subfolder, err)
	}

	var uploadedPaths []string
	for i, file := range files {
		timestamp := time.Now().Unix()
		newFilename := fmt.Sprintf("%d_%d_%s", timestamp, i, file.Filename)
		fullPath := filepath.Join(entryPath, newFilename)

		if err := c.SaveUploadedFile(file, fullPath); err != nil {
			return nil, fmt.Errorf("falha ao salvar imagem: %v", err)
		}

		relativePath := filepath.ToSlash(filepath.Join(basePath, entryID, subfolder, newFilename))
		uploadedPaths = append(uploadedPaths, relativePath)
	}
	return uploadedPaths, nil
}

func UploadCheckInImages() gin.HandlerFunc {
	return func(c *gin.Context) {
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
			c.JSON(http.StatusNotFound, gin.H{"error": "CarEntry não encontrado"})
			return
		}

		uploadedPaths, err := uploadImages(c, entryID, "checkin")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		update := bson.M{
			"$push": bson.M{
				"checkIn.images": bson.M{"$each": uploadedPaths},
			},
		}
		_, err = carEntryCollection.UpdateOne(ctx, bson.M{"_id": objectID}, update)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao atualizar CarEntry com imagens"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Imagens de check-in enviadas com sucesso",
			"paths":   uploadedPaths,
		})
	}
}

func UploadCheckOutImages() gin.HandlerFunc {
	return func(c *gin.Context) {
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
			c.JSON(http.StatusNotFound, gin.H{"error": "CarEntry não encontrado"})
			return
		}

		uploadedPaths, err := uploadImages(c, entryID, "checkout")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		update := bson.M{
			"$push": bson.M{
				"checkOut.images": bson.M{"$each": uploadedPaths},
			},
		}
		_, err = carEntryCollection.UpdateOne(ctx, bson.M{"_id": objectID}, update)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao atualizar CarEntry com imagens"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Imagens de check-out enviadas com sucesso",
			"paths":   uploadedPaths,
		})
	}
}
