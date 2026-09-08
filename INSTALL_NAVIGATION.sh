#!/bin/bash

# 📦 Script para instalar todas las dependencias de navegación
# Ejecuta esto en la terminal: bash INSTALL_NAVIGATION.sh

echo "🚀 Instalando dependencias de React Navigation..."
echo ""

echo "1️⃣ Instalando React Navigation (base)..."
npm install @react-navigation/native

echo ""
echo "2️⃣ Instalando dependencias necesarias..."
npm install react-native-screens react-native-safe-area-context

echo ""
echo "3️⃣ Instalando navegadores..."
npm install @react-navigation/native-stack @react-navigation/bottom-tabs

echo ""
echo "4️⃣ Instalando AsyncStorage (persistencia)..."
npm install @react-native-async-storage/async-storage

echo ""
echo "5️⃣ Instalando Redux (estado global)..."
npm install @reduxjs/toolkit react-redux

echo ""
echo "✅ ¡Todas las dependencias instaladas correctamente!"
echo ""
echo "📝 Próximos pasos:"
echo "   1. npm run ios     (para iOS)"
echo "   2. npm run android (para Android)"
echo ""
echo "🔗 Deep Linking listo"
echo "💾 AsyncStorage listo"
echo "🏪 Redux listo"
echo ""
