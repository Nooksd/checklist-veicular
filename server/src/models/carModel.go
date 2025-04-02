package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Car struct {
	ID          primitive.ObjectID `bson:"_id" json:"id"`
	Number      string             `bson:"number" json:"number" validate:"required"`
	Plate       string             `bson:"plate" json:"plate" validate:"required,len=7"`
	Model       string             `bson:"model" json:"model" validate:"required"`
	Brand       string             `bson:"brand" json:"brand" validate:"required"`
	Year        int                `bson:"year" json:"year" validate:"required"`
	IsActive    bool               `bson:"isActive" json:"isActive" validate:"required"`
	Consumption float32            `bson:"consumption" json:"consumption" validate:"required,gt=0"`
}
