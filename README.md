# NeuroFlex VR - Dashboard Institucional 📱

Aplicación móvil y web desarrollada en **React Native (Expo)** para especialistas clínicos. Permite monitorear las sesiones de evaluación cognitiva realizadas por pacientes en visores de realidad virtual (Meta Quest 3).

## Características Principales

*   **Autenticación Segura:** Inicio de sesión integrado con **AWS Cognito** (flujo `USER_PASSWORD_AUTH`), utilizando tokens JWT para proteger las peticiones a la API.
*   **Monitoreo en Tiempo Real:** Consumo de datos estructurados desde **AWS DynamoDB** a través de una API Gateway protegida.
*   **Visualización de Métricas:** Dashboard con tarjetas que muestran el puntaje cognitivo, la duración de la sesión y el nivel de dificultad.
*   **Análisis Clínico con IA:** Botón interactivo que despliega una burbuja con el resumen clínico generado por un modelo de lenguaje (Qwen) procesado en Google Colab.
*   **Gestión de Sesiones:** Capacidad de eliminar registros de evaluaciones directamente desde la interfaz (con confirmación nativa).
*   **Diseño UI/UX:** Interfaz en modo oscuro con efectos de "Aurora Boreal" animados de forma nativa.

## Tecnologías Utilizadas

*   **Frontend:** React Native, Expo, TypeScript.
*   **Navegación:** Expo Router.
*   **Estilos:** React Native StyleSheet y Expo Linear Gradients.
*   **Backend en la Nube:** AWS (API Gateway, Lambda, Cognito, DynamoDB, S3, SQS).
*   **Procesamiento IA:** Python, Google Colab (GPU).

## Requisitos Previos

Asegúrate de tener instalado:
*   Node.js (v18 o superior)
*   npm o yarn
*   Expo Go en tu dispositivo móvil (para pruebas) o un emulador.

##  Cómo ejecutar el proyecto

1.  Clona este repositorio e ingresa a la carpeta:
    ```bash
    git clone https://github.com/prxska/neuro-app.git
    cd neuroflex-dashboard
    npx expo start -c --tunnel



    
