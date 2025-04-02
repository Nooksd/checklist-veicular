package helpers

import (
	"log"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type SignedDetails struct {
	UserId   string
	Name     string
	UserType string
	jwt.RegisteredClaims
}

var SECRET_KEY string = os.Getenv("SECRET_KEY")

func GenerateTokens(userId string, name string, userType string, keepLogged bool) (signedAccessToken string, signedRefreshToken string, err error) {
	accessTokenDuration := time.Hour * 24
	refreshTokenDuration := time.Hour * 24 * 60

	accessClaims := &SignedDetails{
		UserId:   userId,
		Name:     name,
		UserType: userType,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(accessTokenDuration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	refreshClaims := &SignedDetails{
		UserId:   userId,
		Name:     name,
		UserType: userType,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(refreshTokenDuration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	accessToken, err := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims).SignedString([]byte(SECRET_KEY))
	if err != nil {
		log.Println("Erro ao criar Access Token:", err)
		return "", "", err
	}

	refreshToken, err := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims).SignedString([]byte(SECRET_KEY))
	if err != nil {
		log.Println("Erro ao criar Refresh Token:", err)
		return "", "", err
	}

	if keepLogged {
		return accessToken, refreshToken, nil
	}

	return accessToken, "", nil
}
