# 🚀 SafeRide CI/CD Using GitHub Actions (SonarQube, Nexus, Docker, EC2)

This guide allows ANYONE to deploy the full SafeRide frontend application using **GitHub Actions**.

It includes:

- Build  
- Test  
- SonarQube  
- Nexus upload  
- DockerHub push  
- Auto-deploy to EC2  

---

## 🔐 1. SERVER SETUP (EC2)

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

### SonarQube

```
docker run -d --name sonar -p 9000:9000 sonarqube:lts
Nexus (RAW repo for artifacts)
docker run -d --name nexus -p 8081:8081 sonatype/nexus3
Nginx for hosting Docker app(optional)
docker run -d --name nginx -p 80:80 nginx

```

# 🔐 3. CREATE GITHUB SECRETS

Go to:

**Repo → Settings → Secrets → Actions → New Secret**

Add these:

| Secret Name | Value |
|-------------|--------|
| `SONAR_TOKEN` | SonarQube token |
| `NEXUS_USER` | Nexus username |
| `NEXUS_PASS` | Nexus password |
| `DOCKER_USERNAME` | DockerHub username |
| `DOCKER_PASSWORD` | DockerHub password |
| `EC2_SSH_KEY` | Contents of your private key (.pem) |

---

# 🧾 2. CREATE `.github/workflows/ci.yml`

Add this file:

```yaml
name: SafeRide CI/CD

on:
  push:
    branches: [ "main" ]

env:
  NEXUS_URL: "http://3.135.233.41:8081/repository/safe-ride-repo"
  SONAR_HOST: "http://3.135.233.41:9000"
  IMAGE_NAME: "sgorijala513/safe-ride-app"

jobs:
  build:
    runs-on: ubuntu-latest

    steps:

    - name: Checkout Code
      uses: actions/checkout@v4

    - name: Use Node.js 20
      uses: actions/setup-node@v4
      with:
        node-version: 20

    - name: Install Dependencies
      run: npm install

    - name: Run Tests
      run: npm test || true

    - name: SonarQube Scan
      run: |
        docker run --rm \
          -v ${{ github.workspace }}:/usr/src \
          sonarsource/sonar-scanner-cli \
          -Dsonar.projectKey=my-node-app \
          -Dsonar.sources=. \
          -Dsonar.exclusions=node_modules/**,dist/** \
          -Dsonar.host.url=${{ env.SONAR_HOST }} \
          -Dsonar.token=${{ secrets.SONAR_TOKEN }}

    - name: Build App
      run: |
        npm run build
        zip -r dist.zip dist

    - name: Upload Artifact to Nexus RAW Repo
      run: |
        curl -v -u "${{ secrets.NEXUS_USER }}:${{ secrets.NEXUS_PASS }}" \
          --upload-file dist.zip \
          "${{ env.NEXUS_URL }}/safe-ride-app-${{ github.sha }}.zip"

    - name: Build Docker Image
      run: docker build -t $IMAGE_NAME:${{ github.sha }} .

    - name: Login to DockerHub
      run: echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin

    - name: Push Docker Image
      run: docker push $IMAGE_NAME:${{ github.sha }}

    - name: Add SSH Key
      run: |
        echo "${{ secrets.EC2_SSH_KEY }}" > ec2_key.pem
        chmod 600 ec2_key.pem

    - name: Deploy to EC2
      run: |
        ssh -i ec2_key.pem -o StrictHostKeyChecking=no ubuntu@3.135.233.41 << EOF
          docker pull $IMAGE_NAME:${{ github.sha }}
          docker stop safe-ride || true
          docker rm safe-ride || true
          docker run -d --name safe-ride -p 8090:80 $IMAGE_NAME:${{ github.sha }}
        EOF
```

<img width="1800" height="1169" alt="Image" src="https://github.com/user-attachments/assets/37a0917d-52c5-4dae-b732-16e54709878a" />

