pipeline {
    agent any

    environment {
        // Credentials must be type: "Username + Password" or "Secret Text"
        SONAR_TOKEN = credentials('sonar')          // secret text
        DOCKERHUB_USR = credentials('docker').USR   // username
        DOCKERHUB_PSW = credentials('docker').PSW   // password
        NEXUS_USR = credentials('nexus').USR        // username
        NEXUS_PSW = credentials('nexus').PSW        // password

        COMMIT_HASH = "${env.GIT_COMMIT[0..6]}"
        IMAGE_NAME = "yourdockerhubusername/safe-ride-app:${env.GIT_COMMIT[0..6]}"
        NEXUS_URL = "http://3.135.233.41:8081/repository/safe-ride-repo/"
    }

    tools {
        nodejs 'node16'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                echo "Using commit: ${env.GIT_COMMIT}"
            }
        }

        stage('Install Dependencies') {
            steps {
                sh "npm install"
            }
        }

        stage('Run Tests') {
            steps {
                sh "npm test || true"
            }
        }

        stage('SonarQube Analysis') {
            steps {
                echo "Starting SonarQube Scan..."
                sh '''
                docker run --rm \
                -v "$(pwd):/usr/src" \
                sonarsource/sonar-scanner-cli \
                -Dsonar.projectKey=my-node-app \
                -Dsonar.sources=. \
                -Dsonar.exclusions=node_modules/**,dist/** \
                -Dsonar.host.url=http://3.135.233.41:9000 \
                -Dsonar.token=$SONAR_TOKEN
                '''
            }
        }

        stage('Build App') {
            steps {
                sh "npm run build"
                sh "zip -r dist.zip dist"
            }
        }

        stage('Upload Artifact to Nexus') {
            steps {
                sh '''
                curl -v -u $NEXUS_USR:$NEXUS_PSW \
                --upload-file dist.zip \
                $NEXUS_URL"safe-ride-app-$COMMIT_HASH.zip"
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t $IMAGE_NAME ."
            }
        }

        stage('Push Docker Image') {
            steps {
                sh '''
                echo "$DOCKERHUB_PSW" | docker login -u "$DOCKERHUB_USR" --password-stdin
                docker push $IMAGE_NAME
                '''
            }
        }
    }

    post {
        success {
            echo "SUCCESS: Pushed image $IMAGE_NAME"
        }
        failure {
            echo "FAILED: See logs!"
        }
    }
}
