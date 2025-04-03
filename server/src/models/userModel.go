package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID       primitive.ObjectID `bson:"_id" json:"id"`
	Name     string             `bson:"name" json:"name" validate:"required"`
	Email    string             `bson:"email" json:"email" validate:"required"`
	Password string             `bson:"password" json:"password" validate:"required"`
	UserType string             `bson:"userType" json:"userType" validate:"required"`
	CNH      string             `bson:"cnh" json:"cnh" validate:"required,len=11,numeric"`
	IsActive bool               `bson:"isActive" json:"isActive" validate:"required"`
}
