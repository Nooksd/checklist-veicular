package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Employee struct {
	ID       primitive.ObjectID `bson:"_id" json:"id"`
	Name     string             `bson:"name" json:"name" validate:"required"`
	CNH      string             `bson:"cnh" json:"cnh" validate:"required,len=11,numeric"`
	IsActive bool               `bson:"isActive" json:"isActive" validate:"required"`
}
