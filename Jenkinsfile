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
        IMAGE_NAME  = "sgorijala513/safe-ride-app:${env.GIT_COMMIT[0..6]}"
        NEXUS_URL   = "http://3.135.233.41:8081/repository/safe-ride-repo"
    }

    stages {

        /* ----------------------------- CHECKOUT ----------------------------- */
        stage('Checkout') {
            steps {
                checkout scm
                echo "Commit Hash: ${env.GIT_COMMIT}"
            }
        }

        /* ----------------------------- INSTALL DEPS ----------------------------- */
        stage('Install Dependencies') {
            steps {
                sh "npm install"
            }
        }

        /* ----------------------------- TESTS ----------------------------- */
        stage('Run Tests') {
            steps {
                sh "npm test || true"
            }
        }

        /* ----------------------------- SONAR ----------------------------- */
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

        /* ----------------------------- BUILD APP ----------------------------- */
        stage('Build App') {
            steps {
                sh "npm run build"
                sh "zip -r dist.zip dist"
            }
        }

        /* ----------------------------- UPLOAD TO NEXUS ----------------------------- */
        stage('Upload Artifact to Nexus') {
            steps {
                sh '''
                curl -v -u $NEXUS_USR:$NEXUS_PSW \
                    --upload-file dist.zip \
                    $NEXUS_URL/safe-ride-app-$COMMIT_HASH.zip
                '''
            }
        }

        /* ----------------------------- BUILD DOCKER ----------------------------- */
        stage('Build Docker Image') {
            steps {
                sh '''
                docker build -t $IMAGE_NAME .
                '''
            }
        }

        /* ----------------------------- PUSH DOCKER ----------------------------- */
        stage('Push Docker Image') {
            steps {
                sh '''
                echo "$DOCKERHUB_PSW" | docker login -u "$DOCKERHUB_USR" --password-stdin
                docker push $IMAGE_NAME
                '''
            }
        }

        /* ----------------------------- DEPLOY TO NGINX ----------------------------- */
        stage('Deploy to NGINX Server') {
            steps {
                sh '''
                echo "Stopping old container if exists..."
                docker stop nginx || true
                docker rm nginx || true

                echo "Pulling latest image..."
                docker pull $IMAGE_NAME

                echo "Starting new NGINX container..."
                docker run -d \
                    --name nginx \
                    -p 80:80 \
                    $IMAGE_NAME

                echo "Deployment completed. App available on port 80."
                '''
            }
        }
    }

    /* ----------------------------- POST ----------------------------- */
    post {
        success {
            echo "SUCCESS: Deployed → http://3.135.233.41"
        }
        failure {
            echo "FAILED: Check Jenkins logs"
        }
    }
}
