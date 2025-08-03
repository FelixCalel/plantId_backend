-- CreateEnum
CREATE TYPE "public"."EstadoPlanta" AS ENUM ('ACTIVA', 'INACTIVA');

-- CreateEnum
CREATE TYPE "public"."RolChat" AS ENUM ('USUARIO', 'BOT');

-- CreateTable
CREATE TABLE "public"."Familia" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Familia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Taxonomia" (
    "id" SERIAL NOT NULL,
    "reino" TEXT,
    "filo" TEXT,
    "clase" TEXT,
    "orden" TEXT,
    "genero" TEXT,
    "especie" TEXT,
    "rango" TEXT,
    "familiaId" INTEGER NOT NULL,

    CONSTRAINT "Taxonomia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Planta" (
    "id" SERIAL NOT NULL,
    "nombreCientifico" TEXT NOT NULL,
    "nombresComunes" TEXT[],
    "estado" "public"."EstadoPlanta" NOT NULL DEFAULT 'ACTIVA',
    "taxonomiaId" INTEGER NOT NULL,
    "familiaId" INTEGER,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Planta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ImagenPlanta" (
    "id" SERIAL NOT NULL,
    "plantaId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "miniatura" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ImagenPlanta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Identificacion" (
    "id" SERIAL NOT NULL,
    "plantaId" INTEGER,
    "imagenBase64" TEXT NOT NULL,
    "respuestaApi" JSONB NOT NULL,
    "confianza" DOUBLE PRECISION,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Identificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ConversacionChat" (
    "id" SERIAL NOT NULL,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creditosUsados" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ConversacionChat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MensajeChat" (
    "id" SERIAL NOT NULL,
    "conversacionId" INTEGER NOT NULL,
    "rol" "public"."RolChat" NOT NULL,
    "contenido" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MensajeChat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UsoApi" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "estatus" TEXT NOT NULL,
    "limiteCreditos" INTEGER NOT NULL,
    "creditosUsados" INTEGER NOT NULL,
    "creditosRestantes" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsoApi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Familia_nombre_key" ON "public"."Familia"("nombre");

-- CreateIndex
CREATE INDEX "Planta_nombreCientifico_idx" ON "public"."Planta"("nombreCientifico");

-- CreateIndex
CREATE INDEX "ImagenPlanta_plantaId_idx" ON "public"."ImagenPlanta"("plantaId");

-- CreateIndex
CREATE INDEX "MensajeChat_conversacionId_idx" ON "public"."MensajeChat"("conversacionId");

-- CreateIndex
CREATE UNIQUE INDEX "UsoApi_fecha_key" ON "public"."UsoApi"("fecha");

-- AddForeignKey
ALTER TABLE "public"."Taxonomia" ADD CONSTRAINT "Taxonomia_familiaId_fkey" FOREIGN KEY ("familiaId") REFERENCES "public"."Familia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Planta" ADD CONSTRAINT "Planta_taxonomiaId_fkey" FOREIGN KEY ("taxonomiaId") REFERENCES "public"."Taxonomia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Planta" ADD CONSTRAINT "Planta_familiaId_fkey" FOREIGN KEY ("familiaId") REFERENCES "public"."Familia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ImagenPlanta" ADD CONSTRAINT "ImagenPlanta_plantaId_fkey" FOREIGN KEY ("plantaId") REFERENCES "public"."Planta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Identificacion" ADD CONSTRAINT "Identificacion_plantaId_fkey" FOREIGN KEY ("plantaId") REFERENCES "public"."Planta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MensajeChat" ADD CONSTRAINT "MensajeChat_conversacionId_fkey" FOREIGN KEY ("conversacionId") REFERENCES "public"."ConversacionChat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
