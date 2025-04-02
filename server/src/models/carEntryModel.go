package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type CarEntry struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	DeviceInfo DeviceInfo         `bson:"deviceInfo" json:"deviceInfo" validate:"required"`
	CarID      primitive.ObjectID `bson:"carID" json:"carID" validate:"required"`
	EmployeeID primitive.ObjectID `bson:"employeeID" json:"employeeID" validate:"required"`
	CheckIn    CheckIn            `bson:"checkIn" json:"checkIn" validate:"required"`
	StartedAt  time.Time          `bson:"startedAt" json:"startedAt" validate:"required"`
	CheckOut   *CheckOut          `bson:"checkOut" json:"checkOut"`
	KMDriven   *float64           `bson:"kmDriven" json:"kmDriven"`
	EndedAt    *time.Time         `bson:"endedAt" json:"endedAt"`
}

type CheckIn struct {
	Location     Location `bson:"location" json:"location" validate:"required"`
	NextLocation string   `bson:"nextLocation" json:"nextLocation" validate:"required"`
	CarState     string   `bson:"carState" json:"carState" validate:"required"`
	ActualKM     float64  `bson:"actualKM" json:"actualKM" validate:"required"`
	Images       []string `bson:"images,omitempty" json:"images" validate:"max=5"`
}

type CheckOut struct {
	Location Location `bson:"location" json:"location" validate:"required"`
	CarState string   `bson:"carState" json:"carState" validate:"required"`
	ActualKM float64  `bson:"actualKM" json:"actualKM" validate:"required"`
	Images   []string `bson:"images,omitempty" json:"images" validate:"max=5"`
}

type Location struct {
	Latitude  float64 `bson:"latitude" json:"latitude" validate:"required"`
	Longitude float64 `bson:"longitude" json:"longitude" validate:"required"`
}

type DeviceInfo struct {
	UserAgent  string `bson:"userAgent" json:"userAgent"`
	IPAddress  string `bson:"ipAddress" json:"ipAddress"`
	OS         string `bson:"os" json:"os"`
	DeviceType string `bson:"deviceType" json:"deviceType"`
	Browser    string `bson:"browser" json:"browser"`
}
