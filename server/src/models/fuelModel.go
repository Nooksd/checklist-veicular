package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Fuel struct {
	ID          primitive.ObjectID `bson:"_id" json:"id"`
	CarID       primitive.ObjectID `bson:"carID" json:"carID" validate:"required"`
	PreviusFuel float64            `bson:"previusFuel" json:"previusFuel" validate:"required"`
	NewFuel     float64            `bson:"currentFuel" json:"currentFuel" validate:"required"`
	KMDriven    float64            `bson:"KMDriven" json:"KMDriven" validate:"required"`
	CreatedAt   time.Time          `bson:"createdAt" json:"createdAt" validate:"required"`
}
