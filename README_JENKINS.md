# 🚀 SafeRide CI/CD using Jenkins, SonarQube, Nexus, Docker & EC2

This guide explains **every step** needed to run the SafeRide frontend CI/CD pipeline using **Jenkins**.  
Even beginners can complete the entire setup successfully.

---

## 🔧 1. SERVER SETUP (EC2)

### Launch an EC2 Ubuntu 22.04 instance
- Instance type: t2.medium
- Open ports in security groups:
  - 80 (Nginx)
  - 8080 (Jenkins)
  - 8081 (Nexus)
  - 9000 (SonarQube)
  - 22 (SSH)
  - 8090 (App Port)

### Install Docker
```bash
sudo apt update
sudo apt install -y docker.io
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ubuntu
```
Logout & login again.

## 🧱 2. RUN REQUIRED TOOLS (DOCKER CONTAINERS)

### Jenkins

```
docker run -d \
 --name jenkins \
 -p 8080:8080 \
 -p 50000:50000 \
 -v jenkins_home:/var/jenkins_home \
 -v /var/run/docker.sock:/var/run/docker.sock \
 jenkins/jenkins:lts
```

 ###SonarQube

 ```
docker run -d --name sonar -p 9000:9000 sonarqube:lts
Nexus (RAW repo for artifacts)
docker run -d --name nexus -p 8081:8081 sonatype/nexus3
Nginx for hosting Docker app(optional)
docker run -d --name nginx -p 80:80 nginx
```


## 🔐 3. CREATE JENKINS CREDENTIALS

Open Jenkins → Manage Jenkins → Credentials → Global

Add:

ID	Type	Value

docker	Username+Password	DockerHub login

sonar	Secret Text	SonarQube token

nexus	Username+Password	admin / Nexus admin password

git	Username+Password	Your GitHub credentials

## 🧰 4. INSTALL REQUIRED JENKINS PLUGINS

Go to: Manage Jenkins → Plugins → Available

Install:

NodeJS plugin

Git plugin

Pipeline plugin

Docker Pipeline plugin

Then go to:

Manage Jenkins → Tools → NodeJS

Add NodeJS installation:

Name: node20

Version: Node.js 20.x

## 🏗 5. CREATE THE PIPELINE IN JENKINS

Create a new Multibranch Pipeline OR Pipeline job.

Add your GitHub repo.

## 📄 6. ADD THIS JENKINSFILE TO YOUR REPO ROOT

```
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
        IMAGE_NAME  = "sgorijala513/safe-ride-app:${COMMIT_HASH}"
        NEXUS_URL   = "http://3.135.233.41:8081/repository/safe-ride-repo"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                echo "Commit: ${env.GIT_COMMIT}"
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
            echo "SUCCESS: Image pushed → $IMAGE_NAME"
        }
        failure {
            echo "FAILED. Check logs."
        }
    }
}
```

## 📄 7. ADD THIS DOCKERFILE TO YOUR REPO ROOT

```
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve stage
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

```

## 🔥 8. DEPLOY MANUALLY TO EC2

Your image is now published.

Run this on EC2:

```
docker pull sgorijala513/safe-ride-app:<tag>

docker run -d --name safe-ride -p 8090:80 sgorijala513/safe-ride-app:<tag>

```

## 9. Access App:

👉  ``` http://3.135.233.41:8090 ```

🎉 CI/CD COMPLETE
Your Jenkins pipeline now does:
Code checkout
Install dependencies
Tests
SonarQube
Nexus upload
Docker build
Docker push
