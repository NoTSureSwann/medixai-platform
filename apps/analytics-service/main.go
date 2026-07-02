package main

import (
	"context"
	"fmt"
	"log"
	"net"
	"os"

	"github.com/streadway/amqp"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"

	pb "github.com/goklinik/analytics-service/proto/analytics"
)

type server struct {
	pb.UnimplementedAnalyticsServiceServer
	rabbitConn *amqp.Connection
	rabbitCh   *amqp.Channel
}

func (s *server) TrackActivity(ctx context.Context, req *pb.ActivityRequest) (*pb.ActivityResponse, error) {
	log.Printf("Tracking Activity: UserID=%s, Role=%s, Action=%s, Details=%s", req.UserId, req.Role, req.Action, req.Details)
	
	// Publish event to RabbitMQ
	body := fmt.Sprintf(`{"userId":"%s","role":"%s","action":"%s","details":"%s"}`, req.UserId, req.Role, req.Action, req.Details)
	err := s.rabbitCh.Publish(
		"goklinik_events", // exchange
		"activity.track", // routing key
		false,            // mandatory
		false,            // immediate
		amqp.Publishing{
			ContentType: "application/json",
			Body:        []byte(body),
		},
	)
	if err != nil {
		log.Printf("Failed to publish RabbitMQ event: %v", err)
	}

	return &pb.ActivityResponse{
		Success: true,
		Message: "Activity tracked successfully",
	}, nil
}

func (s *server) GenerateMonthlyReport(ctx context.Context, req *pb.ReportRequest) (*pb.ReportResponse, error) {
	log.Printf("Generating monthly report for: %s/%s", req.Month, req.Year)
	
	// Mock generation of report
	return &pb.ReportResponse{
		ReportId:          "rep-123",
		PdfUrl:            "/reports/monthly-report-" + req.Month + "-" + req.Year + ".pdf",
		TotalAppointments: 154,
		TotalRevenue:      250000000.0, // Rp. 250,000,000
		Status:            "COMPLETED",
	}, nil
}

func (s *server) GetGeospatialData(ctx context.Context, req *pb.GeospatialRequest) (*pb.GeospatialResponse, error) {
	log.Printf("Fetching geospatial disease data for: %s", req.Region)

	// Mock geospatial disease data for Indonesia
	data := []*pb.DiseaseData{
		{Disease: "Dengue Fever", Cases: 45, Latitude: -6.2088, Longitude: 106.8456},    // Jakarta
		{Disease: "Malaria", Cases: 32, Latitude: -2.5337, Longitude: 140.7181},         // Papua
		{Disease: "Tuberculosis", Cases: 88, Latitude: -7.2575, Longitude: 112.7521},    // Surabaya
		{Disease: "Influenza", Cases: 120, Latitude: -5.1476, Longitude: 119.4327},      // Makassar
	}

	return &pb.GeospatialResponse{
		Data: data,
	}, nil
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "50051"
	}

	lis, err := net.Listen("tcp", ":"+port)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	// Setup RabbitMQ connection
	rabbitURL := os.Getenv("RABBITMQ_URL")
	if rabbitURL == "" {
		rabbitURL = "amqp://guest:guest@localhost:5672/"
	}
	
	conn, err := amqp.Dial(rabbitURL)
	var ch *amqp.Channel
	if err != nil {
		log.Printf("WARN: Failed to connect to RabbitMQ (will run without broker): %v", err)
	} else {
		defer conn.Close()
		ch, err = conn.Channel()
		if err != nil {
			log.Fatalf("Failed to open a channel: %v", err)
		}
		defer ch.Close()

		// Declare Exchange
		err = ch.ExchangeDeclare(
			"goklinik_events", // name
			"topic",          // type
			true,             // durable
			false,            // auto-deleted
			false,            // internal
			false,            // no-wait
			nil,              // arguments
		)
		if err != nil {
			log.Fatalf("Failed to declare exchange: %v", err)
		}
	}

	s := grpc.NewServer()
	pb.RegisterAnalyticsServiceServer(s, &server{
		rabbitConn: conn,
		rabbitCh:   ch,
	})
	
	reflection.Register(s)

	log.Printf("Analytics gRPC service starting on port %s...", port)
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
