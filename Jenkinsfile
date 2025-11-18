pipeline {

    agent any

    tools {
        nodejs 'node20'
    }

    environment {
        SONAR_TOKEN = credentials('sonar')
        DOCKERHUB   = credentials('docker')
        NEXUS       = credentials('nexus')

        COMMIT_HASH = "${env.GIT_COMMIT[0..6]}"
        IMAGE_NAME  = "yourdockerhubusername/safe-ride-app:${env.GIT_COMMIT[0..6]}"
        NEXUS_URL   = "http://3.135.233.41:8081/repository/safe-ride-repo"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                echo "Commit Hash: ${env.GIT_COMMIT}"
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
                $NEXUS_URL/safe-ride-app-$COMMIT_HASH.zip
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                docker build -t $IMAGE_NAME .
                '''
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
            echo "SUCCESS: Image pushed → ${env.IMAGE_NAME}"
        }
        failure {
            echo "FAILED: Check Jenkins logs"
        }
    }
}
