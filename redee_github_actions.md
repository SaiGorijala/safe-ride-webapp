# Complete CI/CD Pipeline Documentation

## Java WebApp • **GitHub Actions** • Docker • SonarQube • Nexus • Custom Tomcat • AWS EC2

---

# 📘 1. Project Overview

This project implements a complete End-to-End CI/CD pipeline using:

* **AWS EC2 t3.large (16GB storage)**
* **Docker** to run all services (**SonarQube, Nexus, Tomcat**)
* **GitHub Actions** for CI/CD automation
* **SonarQube** for code quality analysis
* **Nexus Repository** for Maven artifact (`.war`) storage
* **Custom Tomcat Server** Docker image as a deployment target
* **Docker Hub** for hosting production images
* **GitHub** as SCM and hosting the CI/CD workflow

This documentation is written so even someone **with zero prior DevOps knowledge** should be able to follow and complete the project.

---

# 🚀 2. EC2 Setup

## 2.1 Launch the EC2 Instance
1.  **AMI:** Ubuntu 22.04.
2.  **Instance Type:** **t3.large**.
3.  **Storage:** **16 GB**.
4.  **Security group inbound rules (Open ports):**
    * `22` SSH your-IP
    * `8080` Tomcat
    * `8081` Nexus
    * `9000` SonarQube
5.  Launch the instance.

## 2.2 Connect to EC2 & Install Updates

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>
sudo apt update -y
sudo apt upgrade -y
```
# 🐳 3. Install Docker

## 3.1 Install Docker Engine

```
# Install dependencies
sudo apt install -y ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL [https://download.docker.com/linux/ubuntu/gpg](https://download.docker.com/linux/ubuntu/gpg) | \
 sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up the repository
echo \
 "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
 [https://download.docker.com/linux/ubuntu](https://download.docker.com/linux/ubuntu) \
 $(lsb_release -cs) stable" | \
 sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update -y
sudo apt install -y docker-ce docker-ce-cli containerd.io
```
## 3.2 Add User to Docker Group and Reconnect

```
sudo usermod -aG docker ubuntu
exit # Must exit and reconnect for group changes to take effect
```

# 🧩 4. Clone the Java WebApp Repository

``` Bash
cd ~
git clone [https://github.com/SaiGorijala/level-devil-webapp.git](https://github.com/SaiGorijala/level-devil-webapp.git)
cd level-devil-webapp
```

This repo is expected to contain:

Java WebApp (.war built via Maven)

Dockerfile (for final deployment image)

GitHub Actions workflow (.github/workflows/cicd.yml)

<img width="983" height="165" alt="Image" src="https://github.com/user-attachments/assets/337fd229-9ac1-44e0-916c-9220dcc0bc98" />

# 📦 5. Deploy DevOps Tools in Docker Containers

All services run on the one EC2 instance via Docker.

## 5.1 SonarQube

```Bash
docker run -d --name sonarqube -p 9000:9000 sonarqube:lts-community
# Access: http://<EC2_IP>:9000, Login: admin/admin
```

## 5.2 Nexus Repository Manager


```Bash
docker run -d --name nexus -p 8081:8081 sonatype/nexus3
# Get password: docker exec -it nexus cat /nexus-data/admin.password
# Create: maven-snapshots repo, admin user/token
# Access: http://<EC2_IP>:8081/repository/maven-snapshots/
```

<img width="1676" height="330" alt="Image" src="https://github.com/user-attachments/assets/9b624c6f-a291-4ac4-9d11-95e131290fcd" />

# 🐱‍🏍 6. Custom Tomcat Server Setup

A standard Tomcat container is run, configured, and then committed to create a reusable base image for deployment.

## 6.1 Run and Configure Standard Tomcat

``` Bash
# Run a standard Tomcat container
docker run -d --name tomcat -p 8080:8080 tomcat:10.1-jdk17-temurin

# Enter the container to fix webapps
docker exec -it tomcat bash
cd /usr/local/tomcat
mv webapps.dist/* webapps/

# Edit tomcat-users.xml (Add manager/admin roles and user)
# Remove Valve IP block from context.xml files:
# webapps/manager/META-INF/context.xml
# webapps/host-manager/META-INF/context.xml
exit
```

## 6.2 Create and Push Custom Tomcat Image

After fixing configuration, commit and push the custom image to Docker Hub.

``` Bash
docker commit tomcat custom-tomcat:configured
docker tag custom-tomcat:configured sgorijala513/tomcat:base-config
docker push sgorijala513/tomcat:base-config
This custom image (sgorijala513/tomcat:base-config) is now the base image used for deployments in the Dockerfile.
```

<img width="1782" height="873" alt="Image" src="https://github.com/user-attachments/assets/e36c1262-9d33-4a32-9a45-6cf05d46ffd3" />

# 🛠 7. GitHub Actions Setup

The CI/CD process is managed by a single pipeline file located at .github/workflows/cicd.yml.

## 7.1 Pipeline Summary

The pipeline runs on every push to the main branch and performs the following jobs:

Checkout code.

Maven build + SonarQube analysis.

Build WAR.

Extract Version from pom.xml.

Upload WAR to Nexus using curl.

Login to Docker Hub.

Build Docker Image (multi-stage, downloading WAR from Nexus).

Push Docker Image to Docker Hub.

Deploy to EC2 (SSH): pull the latest image, stop/remove old container, and start new container on port 8080.


# 7.2 GitHub Action Secrets

You must configure the following secrets in your GitHub repository: GitHub → Repo → Settings → Secrets → Actions

Secret Name	Purpose

NEXUS_URL	Nexus snapshots repo URL

NEXUS_USER	Nexus admin/token username

NEXUS_PASS	Nexus admin/token password

SONAR_HOST_URL	SonarQube access URL

SONAR_TOKEN	SonarQube user token

DOCKERHUB_USERNAME	Your Docker Hub username

DOCKERHUB_TOKEN	Your Docker Hub PAT

SSH_HOST	EC2 Public IP address

SSH_USER	ubuntu

SSH_PRIVATE_KEY	Contents of your EC2 .pem file

<img width="1154" height="463" alt="Image" src="https://github.com/user-attachments/assets/8ccdbf68-8470-4536-9f80-3f123a6d6313" />

# 📑 8. Dockerfile for Deployable Image

This multi-stage Dockerfile is responsible for fetching the latest built artifact (WAR file) from Nexus and deploying it onto the custom Tomcat base image.

### Dockerfile

```
# -------- Stage 1: Downloader --------
FROM eclipse-temurin:17-jre AS downloader

ARG NEXUS_URL
ARG GROUP_ID_PATH
ARG APP_NAME
ARG VERSION
ARG NEXUS_USER
ARG NEXUS_PASS

# Construct URL correctly using ARG (NOT ENV)
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Build the Nexus path only during RUN (correct ARG expansion)
RUN ARTIFACT_URL="${NEXUS_URL}${GROUP_ID_PATH}/${APP_NAME}/${VERSION}/${APP_NAME}-${VERSION}.war" && \
    echo "Downloading WAR from: ${ARTIFACT_URL}" && \
    curl -u "${NEXUS_USER}:${NEXUS_PASS}" -L "${ARTIFACT_URL}" -o /tmp/app.war

# -------- Stage 2: Tomcat --------
FROM tomcat:10.1-jdk17-temurin

# Remove the default ROOT app
RUN rm -rf /usr/local/tomcat/webapps/ROOT

# Copy the downloaded war as ROOT.war for auto-deploy
COPY --from=downloader /tmp/app.war /usr/local/tomcat/webapps/ROOT.war
```

# 🔁 9. Complete CI/CD Workflow
Here is the full automation pipeline flow:

Push code to GitHub's main branch → GitHub Actions starts.

Maven builds, tests, and runs SonarQube scan.

WAR artifact is uploaded to Nexus.

Dockerfile fetches the new WAR from Nexus.

Docker image is built and pushed to Docker Hub.

GitHub Actions uses SSH to connect to EC2.

EC2 pulls the updated image.

Old Tomcat container is stopped and removed.

New Tomcat container starts with the updated application.

App is live on EC2.

# 🌐 10. Access the Application
Open in browser:

http://<EC2_PUBLIC_IP>:8080/
Your Java application will load automatically after every successful Git push.

<img width="1800" height="1169" alt="Image" src="https://github.com/user-attachments/assets/7d12378a-257b-4c70-8a2e-6beef9400e7e" />

# 🏁 11. Final Result
You have successfully implemented a complete and automated CI/CD setup for a Java web application:

✔ EC2 setup

✔ Docker environment

✔ SonarQube for quality

✔ Nexus for artifact management

✔ Custom Tomcat image

✔ GitHub Actions pipeline

✔ Automated deployment to EC2

This pipeline continuously builds, analyzes, stores, packages, and deploys your Java application end-to-end.

<img width="1800" height="1169" alt="Image" src="https://github.com/user-attachments/assets/03aec8dc-f800-49f2-87e9-78a266e8c0fd" />

🎉 Project Completed Successfully
