-- MySQL dump 10.13  Distrib 26.10.0, for macos27.0 (arm64)
--
-- Host: localhost    Database: BoomNailsDB_V2
-- ------------------------------------------------------
-- Server version	9.7.4

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `carrito`
--

DROP TABLE IF EXISTS `carrito`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carrito` (
  `id_carrito` bigint NOT NULL AUTO_INCREMENT,
  `id_cliente` bigint DEFAULT NULL,
  `token_sesion` varchar(255) NOT NULL,
  `estado` enum('ACTIVO','CONVERTIDO','ABANDONADO') NOT NULL DEFAULT 'ACTIVO',
  `fecha_creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_carrito`),
  UNIQUE KEY `uq_carrito_token` (`token_sesion`),
  KEY `idx_carrito_cliente_estado` (`id_cliente`,`estado`),
  CONSTRAINT `fk_carrito_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `categoria`
--

DROP TABLE IF EXISTS `categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoria` (
  `id_categoria` bigint NOT NULL AUTO_INCREMENT,
  `id_categoria_padre` bigint DEFAULT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(500) DEFAULT NULL,
  `estado` enum('ACTIVA','INACTIVA') NOT NULL DEFAULT 'ACTIVA',
  `fecha_creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `imagen_url` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id_categoria`),
  UNIQUE KEY `uq_categoria_padre_nombre` (`id_categoria_padre`,`nombre`),
  CONSTRAINT `fk_categoria_padre` FOREIGN KEY (`id_categoria_padre`) REFERENCES `categoria` (`id_categoria`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cliente`
--

DROP TABLE IF EXISTS `cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cliente` (
  `id_cliente` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `correo` varchar(150) NOT NULL,
  `telefono` varchar(30) NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_cliente`),
  KEY `idx_cliente_correo` (`correo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `compra_inventario`
--

DROP TABLE IF EXISTS `compra_inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compra_inventario` (
  `id_compra` bigint NOT NULL AUTO_INCREMENT,
  `id_proveedor` bigint NOT NULL,
  `id_usuario` bigint NOT NULL,
  `numero_factura` varchar(100) DEFAULT NULL,
  `fecha_compra` datetime NOT NULL,
  `subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `observaciones` text,
  `estado` enum('REGISTRADA','ANULADA') NOT NULL DEFAULT 'REGISTRADA',
  `fecha_creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_compra`),
  KEY `fk_compra_usuario` (`id_usuario`),
  KEY `idx_compra_fecha` (`fecha_compra`),
  KEY `idx_compra_proveedor` (`id_proveedor`),
  CONSTRAINT `fk_compra_proveedor` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor` (`id_proveedor`),
  CONSTRAINT `fk_compra_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `comprobante_pago`
--

DROP TABLE IF EXISTS `comprobante_pago`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comprobante_pago` (
  `id_comprobante` bigint NOT NULL AUTO_INCREMENT,
  `id_pago` bigint NOT NULL,
  `ruta_archivo` varchar(500) NOT NULL,
  `tipo_mime` varchar(100) NOT NULL,
  `tamano_bytes` bigint NOT NULL,
  `estado_revision` enum('PENDIENTE','ACEPTADO','RECHAZADO') NOT NULL DEFAULT 'PENDIENTE',
  `revisado_por` bigint DEFAULT NULL,
  `motivo_rechazo` varchar(500) DEFAULT NULL,
  `fecha_subida` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_revision` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_comprobante`),
  KEY `idx_comprobante_estado_fecha` (`estado_revision`,`fecha_subida`),
  KEY `fk_comprobante_pago` (`id_pago`),
  KEY `fk_comprobante_revisor` (`revisado_por`),
  CONSTRAINT `fk_comprobante_pago` FOREIGN KEY (`id_pago`) REFERENCES `pago` (`id_pago`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_comprobante_revisor` FOREIGN KEY (`revisado_por`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `chk_comprobante_tamano` CHECK ((`tamano_bytes` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `detalle_carrito`
--

DROP TABLE IF EXISTS `detalle_carrito`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_carrito` (
  `id_detalle_carrito` bigint NOT NULL AUTO_INCREMENT,
  `id_carrito` bigint NOT NULL,
  `id_presentacion` bigint NOT NULL,
  `cantidad` int NOT NULL,
  `fecha_agregado` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_detalle_carrito`),
  UNIQUE KEY `uq_detalle_carrito_presentacion` (`id_carrito`,`id_presentacion`),
  KEY `idx_detalle_carrito_presentacion` (`id_presentacion`),
  CONSTRAINT `fk_detalle_carrito_carrito` FOREIGN KEY (`id_carrito`) REFERENCES `carrito` (`id_carrito`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_detalle_carrito_presentacion` FOREIGN KEY (`id_presentacion`) REFERENCES `presentacion_producto` (`id_presentacion`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_detalle_carrito_cantidad` CHECK ((`cantidad` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `detalle_compra_inventario`
--

DROP TABLE IF EXISTS `detalle_compra_inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_compra_inventario` (
  `id_detalle_compra` bigint NOT NULL AUTO_INCREMENT,
  `id_compra` bigint NOT NULL,
  `id_presentacion` bigint NOT NULL,
  `cantidad` int NOT NULL,
  `costo_unitario` decimal(12,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `observaciones` text,
  PRIMARY KEY (`id_detalle_compra`),
  KEY `idx_detalle_compra` (`id_compra`),
  KEY `idx_detalle_presentacion` (`id_presentacion`),
  CONSTRAINT `fk_detalle_compra` FOREIGN KEY (`id_compra`) REFERENCES `compra_inventario` (`id_compra`),
  CONSTRAINT `fk_detalle_presentacion` FOREIGN KEY (`id_presentacion`) REFERENCES `presentacion_producto` (`id_presentacion`),
  CONSTRAINT `chk_detalle_cantidad` CHECK ((`cantidad` > 0)),
  CONSTRAINT `chk_detalle_costo` CHECK ((`costo_unitario` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `detalle_pedido`
--

DROP TABLE IF EXISTS `detalle_pedido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_pedido` (
  `id_detalle_pedido` bigint NOT NULL AUTO_INCREMENT,
  `id_pedido` bigint NOT NULL,
  `id_presentacion` bigint NOT NULL,
  `referencia_snapshot` varchar(80) NOT NULL,
  `nombre_snapshot` varchar(150) NOT NULL,
  `presentacion_snapshot` varchar(50) NOT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(12,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id_detalle_pedido`),
  KEY `idx_detalle_pedido_pedido` (`id_pedido`),
  KEY `idx_detalle_pedido_presentacion` (`id_presentacion`),
  CONSTRAINT `fk_detalle_pedido_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_detalle_pedido_presentacion` FOREIGN KEY (`id_presentacion`) REFERENCES `presentacion_producto` (`id_presentacion`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_detalle_pedido_cantidad` CHECK ((`cantidad` > 0)),
  CONSTRAINT `chk_detalle_pedido_precio` CHECK ((`precio_unitario` >= 0)),
  CONSTRAINT `chk_detalle_pedido_subtotal` CHECK ((`subtotal` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `historial_estado_pedido`
--

DROP TABLE IF EXISTS `historial_estado_pedido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_estado_pedido` (
  `id_historial` bigint NOT NULL AUTO_INCREMENT,
  `id_pedido` bigint NOT NULL,
  `estado_anterior` varchar(30) DEFAULT NULL,
  `estado_nuevo` varchar(30) NOT NULL,
  `id_usuario` bigint DEFAULT NULL,
  `observacion` varchar(500) DEFAULT NULL,
  `fecha_cambio` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_historial`),
  KEY `idx_historial_pedido_fecha` (`id_pedido`,`fecha_cambio`),
  KEY `fk_historial_usuario` (`id_usuario`),
  CONSTRAINT `fk_historial_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_historial_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `imagen_producto`
--

DROP TABLE IF EXISTS `imagen_producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `imagen_producto` (
  `id_imagen` bigint NOT NULL AUTO_INCREMENT,
  `id_producto` bigint NOT NULL,
  `ruta_archivo` varchar(500) NOT NULL,
  `texto_alternativo` varchar(200) DEFAULT NULL,
  `es_principal` tinyint(1) NOT NULL DEFAULT '0',
  `orden_visual` int NOT NULL DEFAULT '0',
  `fecha_creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_imagen`),
  KEY `idx_imagen_producto_orden` (`id_producto`,`orden_visual`),
  CONSTRAINT `fk_imagen_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `movimiento_inventario`
--

DROP TABLE IF EXISTS `movimiento_inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimiento_inventario` (
  `id_movimiento` bigint NOT NULL AUTO_INCREMENT,
  `id_presentacion` bigint NOT NULL,
  `id_usuario` bigint NOT NULL,
  `tipo_movimiento` enum('ENTRADA','SALIDA','AJUSTE') NOT NULL,
  `cantidad` int NOT NULL,
  `stock_anterior` int NOT NULL,
  `stock_resultante` int NOT NULL,
  `motivo` varchar(100) NOT NULL,
  `costo_unitario` decimal(12,2) DEFAULT NULL,
  `documento_referencia` varchar(150) DEFAULT NULL,
  `observaciones` text,
  `fecha_movimiento` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_movimiento`),
  KEY `fk_movimiento_usuario` (`id_usuario`),
  KEY `idx_movimiento_presentacion` (`id_presentacion`),
  KEY `idx_movimiento_fecha` (`fecha_movimiento`),
  KEY `idx_movimiento_tipo` (`tipo_movimiento`),
  CONSTRAINT `fk_movimiento_presentacion` FOREIGN KEY (`id_presentacion`) REFERENCES `presentacion_producto` (`id_presentacion`),
  CONSTRAINT `fk_movimiento_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`),
  CONSTRAINT `chk_movimiento_cantidad` CHECK ((`cantidad` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pago`
--

DROP TABLE IF EXISTS `pago`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pago` (
  `id_pago` bigint NOT NULL AUTO_INCREMENT,
  `id_pedido` bigint NOT NULL,
  `metodo` enum('TRANSFERENCIA') NOT NULL DEFAULT 'TRANSFERENCIA',
  `importe` decimal(12,2) NOT NULL,
  `estado` enum('PENDIENTE','APROBADO','RECHAZADO') NOT NULL DEFAULT 'PENDIENTE',
  `revisado_por` bigint DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_confirmacion` timestamp NULL DEFAULT NULL,
  `observacion_revision` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id_pago`),
  UNIQUE KEY `uq_pago_pedido` (`id_pedido`),
  KEY `idx_pago_estado_fecha` (`estado`,`fecha_creacion`),
  KEY `fk_pago_revisor` (`revisado_por`),
  CONSTRAINT `fk_pago_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_pago_revisor` FOREIGN KEY (`revisado_por`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `chk_pago_importe` CHECK ((`importe` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pedido`
--

DROP TABLE IF EXISTS `pedido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedido` (
  `id_pedido` bigint NOT NULL AUTO_INCREMENT,
  `numero_pedido` varchar(30) NOT NULL,
  `id_cliente` bigint DEFAULT NULL,
  `estado` enum('PAGO_EN_REVISION','PEDIDO_CONFIRMADO','EN_BODEGA','EMPACADO','DESPACHADO','ENTREGADO','CANCELADO') NOT NULL DEFAULT 'PAGO_EN_REVISION',
  `nombre_entrega` varchar(150) NOT NULL,
  `correo_entrega` varchar(150) NOT NULL,
  `telefono_entrega` varchar(30) NOT NULL,
  `direccion_entrega` varchar(255) NOT NULL,
  `ciudad_entrega` varchar(100) NOT NULL,
  `departamento_entrega` varchar(100) NOT NULL,
  `pais_entrega` varchar(100) NOT NULL DEFAULT 'Colombia',
  `nota_entrega` varchar(500) DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `costo_envio` decimal(12,2) NOT NULL DEFAULT '0.00',
  `descuento` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total` decimal(12,2) NOT NULL,
  `transportadora` varchar(120) DEFAULT NULL,
  `numero_guia` varchar(120) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `fecha_despacho` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_pedido`),
  UNIQUE KEY `uq_pedido_numero` (`numero_pedido`),
  KEY `idx_pedido_estado_fecha` (`estado`,`fecha_creacion`),
  KEY `idx_pedido_cliente_fecha` (`id_cliente`,`fecha_creacion`),
  CONSTRAINT `fk_pedido_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `chk_pedido_costo_envio` CHECK ((`costo_envio` >= 0)),
  CONSTRAINT `chk_pedido_descuento` CHECK ((`descuento` >= 0)),
  CONSTRAINT `chk_pedido_despacho` CHECK (((`estado` <> _utf8mb4'DESPACHADO') or ((`transportadora` is not null) and (`transportadora` <> _utf8mb4'') and (`numero_guia` is not null) and (`numero_guia` <> _utf8mb4'')))),
  CONSTRAINT `chk_pedido_subtotal` CHECK ((`subtotal` >= 0)),
  CONSTRAINT `chk_pedido_total` CHECK ((`total` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `presentacion_producto`
--

DROP TABLE IF EXISTS `presentacion_producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `presentacion_producto` (
  `id_presentacion` bigint NOT NULL AUTO_INCREMENT,
  `id_producto` bigint NOT NULL,
  `etiqueta` varchar(50) NOT NULL,
  `volumen_ml` decimal(6,2) DEFAULT NULL,
  `unidades_paquete` int DEFAULT NULL,
  `precio_detal` decimal(12,2) DEFAULT NULL,
  `precio_mayorista` decimal(12,2) DEFAULT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `estado` enum('ACTIVA','INACTIVA') NOT NULL DEFAULT 'ACTIVA',
  `fecha_creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `costo_promedio` decimal(12,2) NOT NULL DEFAULT '0.00',
  `stock_minimo` int NOT NULL DEFAULT '5',
  PRIMARY KEY (`id_presentacion`),
  UNIQUE KEY `uq_presentacion_producto_etiqueta` (`id_producto`,`etiqueta`),
  KEY `idx_presentacion_estado_stock` (`estado`,`stock`),
  CONSTRAINT `fk_presentacion_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_presentacion_medida` CHECK ((((`volumen_ml` is not null) and (`volumen_ml` > 0) and (`unidades_paquete` is null)) or ((`unidades_paquete` is not null) and (`unidades_paquete` > 0) and (`volumen_ml` is null)))),
  CONSTRAINT `chk_presentacion_precio_detalle` CHECK (((`precio_detal` is null) or (`precio_detal` >= 0))),
  CONSTRAINT `chk_presentacion_precio_mayorista` CHECK (((`precio_mayorista` is null) or (`precio_mayorista` >= 0))),
  CONSTRAINT `chk_presentacion_stock` CHECK ((`stock` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=88 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `producto`
--

DROP TABLE IF EXISTS `producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `producto` (
  `id_producto` bigint NOT NULL AUTO_INCREMENT,
  `id_categoria` bigint NOT NULL,
  `referencia` varchar(80) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text,
  `estado` enum('ACTIVO','INACTIVO') NOT NULL DEFAULT 'ACTIVO',
  `fecha_creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_producto`),
  UNIQUE KEY `uq_producto_referencia` (`referencia`),
  KEY `idx_producto_categoria_estado` (`id_categoria`,`estado`),
  KEY `idx_producto_nombre` (`nombre`),
  CONSTRAINT `fk_producto_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id_categoria`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=121 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `proveedor`
--

DROP TABLE IF EXISTS `proveedor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proveedor` (
  `id_proveedor` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `identificacion` varchar(50) DEFAULT NULL,
  `telefono` varchar(30) DEFAULT NULL,
  `correo` varchar(150) DEFAULT NULL,
  `direccion` varchar(250) DEFAULT NULL,
  `observaciones` text,
  `estado` enum('ACTIVO','INACTIVO') NOT NULL DEFAULT 'ACTIVO',
  `fecha_creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_proveedor`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol` enum('ADMIN','CLIENTE') NOT NULL DEFAULT 'CLIENTE',
  `estado` enum('ACTIVO','INACTIVO','BLOQUEADO') NOT NULL DEFAULT 'ACTIVO',
  `fecha_creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ultimo_acceso` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `uq_usuario_correo` (`correo`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping events for database 'BoomNailsDB_V2'
--

--
-- Dumping routines for database 'BoomNailsDB_V2'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-03 17:47:16
