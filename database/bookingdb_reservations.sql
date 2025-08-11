CREATE DATABASE  IF NOT EXISTS `bookingdb` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `bookingdb`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: bookingdb
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `reservations`
--

DROP TABLE IF EXISTS `reservations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `check_in` date DEFAULT NULL,
  `check_out` date DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `cabin_type` enum('DELUXE','FAMILIE','STANDARD') DEFAULT NULL,
  `total_price` double DEFAULT NULL,
  `paid` bit(1) DEFAULT NULL,
  `payment_method` enum('CARD','CASH') DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservations`
--

LOCK TABLES `reservations` WRITE;
/*!40000 ALTER TABLE `reservations` DISABLE KEYS */;
INSERT INTO `reservations` VALUES (2,'2025-07-25','2025-07-27','vasibreban2017@gmail.com','Breban Sergiu Vasile','DELUXE',500,_binary '','CARD'),(3,'2025-07-30','2025-07-31','johndoe@gmail.com','John',NULL,NULL,NULL,NULL),(4,'2025-08-08','2025-08-11','vasibreban2017@gmail.com','Breban Vasile',NULL,NULL,NULL,NULL),(5,'2025-08-08','2025-08-13','vasibreban2017@gmail.com','ianis hagi','DELUXE',1250,NULL,NULL),(6,'2025-11-19','2025-11-25','ionpopescu@gmail.com','Ion Popescu','FAMILIE',1200,NULL,NULL),(7,'2025-08-23','2025-08-29','alecotau@gmail.com','Alexandra cotau','DELUXE',1500,NULL,NULL),(8,'2025-07-28','2025-07-30','vasibreban2017@gmail.com','Diana Pop','STANDARD',300,NULL,NULL),(9,'2025-08-01','2025-08-04','vbreban09@gmail.com','Marc Vasile','DELUXE',750,NULL,NULL),(10,'2025-09-28','2025-09-30','vasibreban2017@gmail.com','Andrei','DELUXE',500,NULL,NULL),(11,'2025-10-27','2025-10-29','vasibreban2017@gmail.com','Marc Emanuel','STANDARD',300,NULL,NULL),(12,'2025-11-27','2025-11-29','vasibreban2017@gmail.com','Marc Andrei','STANDARD',300,NULL,NULL),(13,'2025-11-27','2025-11-29','vasibreban2017@gmail.com','Marc Alex','DELUXE',500,NULL,NULL),(14,'2025-11-27','2025-11-29','vasibreban2017@gmail.com','Pop Vasile','FAMILIE',400,NULL,NULL),(15,'2025-12-01','2025-12-04','vasibreban2017@gmail.com','Pop Ionel','STANDARD',450,NULL,NULL),(16,'2025-12-01','2025-12-04','vasibreban2017@gmail.com','Pop Ionel','STANDARD',450,NULL,NULL),(17,'2025-12-01','2025-12-04','vasibreban2017@gmail.com','Marta Maria','DELUXE',750,NULL,NULL),(18,'2025-12-01','2025-12-04','vasibreban2017@gmail.com','Marta Maria','DELUXE',750,NULL,NULL),(19,'2025-12-09','2025-12-11','vasibreban2017@gmail.com','Pop Bogdan','DELUXE',500,NULL,NULL),(20,'2025-12-12','2025-12-15','vasibreban2017@gmail.com','Relu Nelu','DELUXE',750,NULL,NULL),(21,'2025-12-12','2025-12-15','vasibreban2017@gmail.com','Gheorghe Ghz','STANDARD',450,NULL,NULL),(22,'2025-12-30','2025-12-31','vasibreban2017@gmail.com','Vasi Go','STANDARD',150,_binary '\0',NULL),(23,'2025-12-30','2025-12-31','vasibreban2017@gmail.com','John Doe','DELUXE',250,_binary '\0',NULL),(24,'2025-12-30','2025-12-31','vasibreban2017@gmail.com','Roland Pal','FAMILIE',200,_binary '\0','CASH'),(25,'2026-01-01','2026-01-03','vasibreban2017@gmail.com','Geo Breban','DELUXE',500,_binary '\0','CARD'),(26,'2025-12-22','2025-12-23','vasibreban2017@gmail.com','Vasi Ro','STANDARD',150,_binary '\0','CARD'),(27,'2025-12-22','2025-12-23','vasibreban2017@gmail.com','Vasi smecheru','DELUXE',250,_binary '\0','CARD'),(28,'2025-12-22','2025-12-23','vasibreban2017@gmail.com','Vasi Forta','FAMILIE',200,_binary '\0','CARD'),(29,'2025-12-16','2025-12-17','vasibreban2017@gmail.com','Vasi tare','STANDARD',150,_binary '\0','CARD'),(30,'2025-12-16','2025-12-17','vasibreban2017@gmail.com','Vasi tare','FAMILIE',200,_binary '\0','CARD'),(31,'2025-12-16','2025-12-17','vasibreban2017@gmail.com','Vasi boss','DELUXE',250,_binary '\0','CARD'),(32,'2025-12-18','2025-12-19','vasibreban2017@gmail.com','Vasi qw','DELUXE',250,_binary '\0','CARD'),(33,'2025-12-18','2025-12-19','vasibreban2017@gmail.com','vasi y','FAMILIE',200,_binary '\0','CASH'),(34,'2025-12-20','2025-12-21','vasibreban2017@gmail.com','Vasi zzz','DELUXE',250,_binary '\0','CARD'),(35,'2025-12-01','2025-12-02','vasibreban2017@gmail.com','Vasi qqq','FAMILIE',200,_binary '\0','CARD'),(36,'2025-10-22','2025-10-23','vasibreban2017@gmail.com','Vasi zxc','FAMILIE',200,_binary '','CARD'),(37,'2025-10-22','2025-10-23','vasibreban2017@gmail.com','Vasi boss smecher','DELUXE',250,_binary '\0','CASH'),(38,'2025-10-22','2025-10-23','vasibreban2017@gmail.com','Vasi boss 2','STANDARD',150,_binary '','CARD'),(39,'2025-10-20','2025-10-21','vasibreban2017@gmail.com','alexandra','FAMILIE',200,_binary '','CARD'),(40,'2025-10-20','2025-10-21','vasibreban2017@gmail.com','Ion Iliescu','STANDARD',150,_binary '','CARD'),(41,'2025-10-20','2025-10-21','vasibreban2017@gmail.com','Vasi boss2','DELUXE',250,_binary '\0','CASH'),(42,'2025-10-25','2025-10-26','vasibreban2017@gmail.com','Lumi Breban','DELUXE',250,_binary '\0','CASH');
/*!40000 ALTER TABLE `reservations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-11 12:36:41
