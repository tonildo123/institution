#!/bin/bash

# 🚀 Script completo de instalación y configuración
# Ejecuta: bash SETUP_COMPLETE.sh

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         🚀 INSTALACIÓN COMPLETA DE INSTITUCIÓN APP           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📦 PASO 1: Instalando React Navigation y dependencias...${NC}"
npm install @react-navigation/native
npm install react-native-screens react-native-safe-area-context
npm install @react-navigation/native-stack @react-navigation/bottom-tabs

echo ""
echo -e "${YELLOW}💾 PASO 2: Instalando AsyncStorage (persistencia)...${NC}"
npm install @react-native-async-storage/async-storage

echo ""
echo -e "${YELLOW}🏪 PASO 3: Instalando Redux (estado global)...${NC}"
npm install @reduxjs/toolkit react-redux

echo ""
echo -e "${YELLOW}🔗 PASO 4: Instalando plugin de path aliases...${NC}"
npm install --save-dev babel-plugin-module-resolver

echo ""
echo -e "${GREEN}✅ ¡TODAS LAS DEPENDENCIAS INSTALADAS!${NC}"
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    🎉 CONFIGURACIÓN LISTA                     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${YELLOW}PRÓXIMOS PASOS:${NC}"
echo ""
echo "1️⃣ Limpia el caché de Metro:"
echo "   npm start -- --reset-cache"
echo ""
echo "2️⃣ En otra terminal, ejecuta la app:"
echo "   npm run ios       (para iOS)"
echo "   npm run android   (para Android)"
echo ""
echo "3️⃣ Prueba el flujo:"
echo "   ✓ Abre app → Pantalla Login"
echo "   ✓ Inicia sesión → Dashboard"
echo "   ✓ Cierra app"
echo "   ✓ Reabre app → Debe entrar directo a Dashboard (persistencia)"
echo ""
echo -e "${GREEN}¡Listo para usar! 🚀${NC}"
echo ""
