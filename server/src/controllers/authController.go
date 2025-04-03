package controllers

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"time"

	helper "server/src/helpers"
	model "server/src/models"

	database "server/src/db"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

var userCollection *mongo.Collection = database.OpenCollection(database.Client, "users")
var validate = validator.New()

func VerifyPassword(providedPassword string, storedHash string) error {
	err := bcrypt.CompareHashAndPassword([]byte(storedHash), []byte(providedPassword))
	if err != nil {
		return fmt.Errorf("email ou senha incorretos")
	}
	return nil
}

func LoginUser() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var request = struct {
			Email          string `json:"email" validate:"required"`
			Password       string `json:"password" validate:"required"`
			KeepConnection bool   `json:"keepConnection"`
		}{}

		var foundUser model.User

		if err := c.BindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "erro ao ler dados"})
			return
		}

		validationErrors := validate.Struct(request)
		if validationErrors != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "email e senha são obrigatórios"})
			return
		}

		err := userCollection.FindOne(ctx, bson.M{"email": request.Email}).Decode(&foundUser)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "email e/ou senha incorretos"})
			return
		}

		if err := VerifyPassword(request.Password, foundUser.Password); err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "email e/ou senha incorretos"})
			return
		}

		var keepLoggedIn = false
		if request.KeepConnection {
			keepLoggedIn = true
		}

		accessToken, refreshToken, _ := helper.GenerateTokens(foundUser.ID.Hex(), foundUser.Name, foundUser.UserType, keepLoggedIn)

		http.SetCookie(c.Writer, &http.Cookie{
			Name:     "accessToken",
			Value:    accessToken,
			Path:     "/",
			Domain:   os.Getenv("DOMAIN"),
			Expires:  time.Now().Add(24 * time.Hour),
			HttpOnly: true,
			Secure:   os.Getenv("ENVIROMENT") == "production",
			SameSite: http.SameSiteNoneMode,
		})

		if keepLoggedIn {
			http.SetCookie(c.Writer, &http.Cookie{
				Name:     "refreshToken",
				Value:    refreshToken,
				Path:     "/",
				Domain:   os.Getenv("DOMAIN"),
				Expires:  time.Now().Add(60 * 24 * time.Hour),
				HttpOnly: true,
				Secure:   os.Getenv("ENVIROMENT") == "production",
				SameSite: http.SameSiteNoneMode,
			})
		}

		foundUser.Password = ""

		c.JSON(http.StatusOK, gin.H{
			"accessToken":  accessToken,
			"refreshToken": refreshToken,
			"user":         foundUser,
		})
	}
}

func RefreshToken() gin.HandlerFunc {
	return func(c *gin.Context) {
		refreshToken := c.GetHeader("Token")
		if refreshToken == "" {
			refreshToken, _ = c.Cookie("refreshToken")
			if refreshToken == "" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Token não fornecido"})
				return
			}
		}

		token, err := jwt.Parse(refreshToken, func(token *jwt.Token) (interface{}, error) {
			return []byte(os.Getenv("SECRET_KEY")), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Token inválido"})
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao processar token"})
			return
		}

		userId := claims["UserId"].(string)
		name := claims["Name"].(string)
		userType := claims["UserType"].(string)

		newAccessToken, _, err := helper.GenerateTokens(userId, name, userType, true)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao gerar novo token"})
			return
		}

		http.SetCookie(c.Writer, &http.Cookie{
			Name:     "accessToken",
			Value:    newAccessToken,
			Path:     "/",
			Domain:   os.Getenv("DOMAIN"),
			Expires:  time.Now().Add(24 * time.Hour),
			HttpOnly: true,
			Secure:   os.Getenv("ENVIROMENT") == "production",
			SameSite: http.SameSiteNoneMode,
		})

		c.JSON(http.StatusOK, gin.H{
			"accessToken": newAccessToken,
		})
	}
}

func LogoutUser() gin.HandlerFunc {
	return func(c *gin.Context) {
		token, _ := c.Cookie("accessToken")
		if token == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Token não fornecido"})
			return
		}

		http.SetCookie(c.Writer, &http.Cookie{
			Name:     "accessToken",
			Value:    "",
			Path:     "/",
			Domain:   os.Getenv("DOMAIN"),
			Expires:  time.Now().Add(24 * time.Hour),
			HttpOnly: true,
			Secure:   os.Getenv("ENVIROMENT") == "production",
			SameSite: http.SameSiteNoneMode,
		})
		http.SetCookie(c.Writer, &http.Cookie{
			Name:     "refreshToken",
			Value:    "",
			Path:     "/",
			Domain:   os.Getenv("DOMAIN"),
			Expires:  time.Now().Add(60 * 24 * time.Hour),
			HttpOnly: true,
			Secure:   os.Getenv("ENVIROMENT") == "production",
			SameSite: http.SameSiteNoneMode,
		})

		c.JSON(http.StatusOK, gin.H{"message": "Logout realizado com sucesso"})
	}
}
