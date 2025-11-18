pipeline {
    agent any

    environment {
        SONARQUBE = credentials('sonar')
        DOCKERHUB = credentials('docker')
        NEXUS = credentials('nexus')
        COMMIT_HASH = "${env.GIT_COMMIT[0..6]}"
        IMAGE_NAME = "yourdockerhubusername/safe-ride-app:${COMMIT_HASH}"
        NEXUS_URL = "http://3.135.233.41:8081/repository/safe-ride-repo/"
    }

    tools {
        nodejs 'node16'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test || true'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonarqube-server') {
                    sh """
                    docker run --rm \
                    -v "\$(pwd):/usr/src" \
                    sonarsource/sonar-scanner-cli \
                    -Dsonar.projectKey=my-node-app \
                    -Dsonar.sources=. \
                    -Dsonar.exclusions=node_modules/**,dist/** \
                    -Dsonar.host.url=http://3.135.233.41:9000 \
                    -Dsonar.token=${SONARQUBE}
                    """
                }
            }
        }

        stage('Build App') {
            steps {
                sh 'npm run build'
                sh 'zip -r dist.zip dist'
            }
        }

        stage('Upload Artifact to Nexus') {
            steps {
                sh """
                curl -v -u ${NEXUS_USR}:${NEXUS_PSW} \
                --upload-file dist.zip \
                ${NEXUS_URL}safe-ride-app-${COMMIT_HASH}.zip
                """
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${IMAGE_NAME} ."
            }
        }

        stage('Push Docker Image') {
            steps {
                sh """
                echo "${DOCKERHUB_PSW}" | docker login -u "${DOCKERHUB_USR}" --password-stdin
                docker push ${IMAGE_NAME}
                """
            }
        }
    }

    post {
        success {
            echo "Build Successful: ${IMAGE_NAME}"
        }
        failure {
            echo "Build Failed!"
        }
    }
}
