pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'my-registry.com'
    }

    options {
        timeout(time: 10, unit: 'MINUTES')
    }

    stages {
        stage('Install and Lint') {
            steps {
                sh 'npm ci'
                sh 'npm run lint --workspaces --if-present'
            }
        }

        stage('Prepare Tests') {
            steps {
                sh 'npm run prisma:generate --workspaces --if-present'
                sh 'npm run build -w apps/microfrontends/mfe-list'
                sh 'npm run build -w apps/microfrontends/mfe-form'
            }
        }

        stage('Test') {
            steps {
                script {
                    sh 'npm run preview -w apps/microfrontends/mfe-list &'
                    sh 'npm run preview -w apps/microfrontends/mfe-form &'
                    sh 'sleep 10'
                    sh 'kill $(lsof -t -i :5001) 2>/dev/null || true'
                    sh 'kill $(lsof -t -i :5002) 2>/dev/null || true'
                    sh 'npm run test --workspaces --if-present'
                }
            }
        }

        stage('Build & Push backend') {
            steps {
                script {
                    def image = docker.build("${DOCKER_REGISTRY}/backend:${env.BUILD_ID}", "-f apps/microfrontends/backend/Dockerfile .")
                    docker.withRegistry("https://${DOCKER_REGISTRY}", 'docker-registry-credentials') {
                        image.push()
                        image.push('latest')
                    }
                }
            }
        }

        stage('Build & Push management-client') {
            steps {
                script {
                    def image = docker.build("${DOCKER_REGISTRY}/management-client:${env.BUILD_ID}", "-f apps/management-client/Dockerfile .")
                    docker.withRegistry("https://${DOCKER_REGISTRY}", 'docker-registry-credentials') {
                        image.push()
                        image.push('latest')
                    }
                }
            }
        }

        stage('Build & Push mfe-form') {
            steps {
                script {
                    def image = docker.build("${DOCKER_REGISTRY}/mfe-form:${env.BUILD_ID}", "-f apps/microfrontends/mfe-form/Dockerfile .")
                    docker.withRegistry("https://${DOCKER_REGISTRY}", 'docker-registry-credentials') {
                        image.push()
                        image.push('latest')
                    }
                }
            }
        }

        stage('Build & Push mfe-list') {
            steps {
                script {
                    def image = docker.build("${DOCKER_REGISTRY}/mfe-list:${env.BUILD_ID}", "-f apps/microfrontends/mfe-list/Dockerfile .")
                    docker.withRegistry("https://${DOCKER_REGISTRY}", 'docker-registry-credentials') {
                        image.push()
                        image.push('latest')
                    }
                }
            }
        }

        stage('Build & Push custom-permissions-service') {
            steps {
                script {
                    def image = docker.build("${DOCKER_REGISTRY}/custom-permissions-service:${env.BUILD_ID}", "-f apps/permissions/custom-permissions-service/Dockerfile .")
                    docker.withRegistry("https://${DOCKER_REGISTRY}", 'docker-registry-credentials') {
                        image.push()
                        image.push('latest')
                    }
                }
            }
        }

        stage('Build & Push permissions-orchestrator-service') {
            steps {
                script {
                    def image = docker.build("${DOCKER_REGISTRY}/permissions-orchestrator-service:${env.BUILD_ID}", "-f apps/permissions/permissions-orchestrator-service/Dockerfile .")
                    docker.withRegistry("https://${DOCKER_REGISTRY}", 'docker-registry-credentials') {
                        image.push()
                        image.push('latest')
                    }
                }
            }
        }

        stage('Build & Push external1-service') {
            steps {
                script {
                    def image = docker.build("${DOCKER_REGISTRY}/external1-service:${env.BUILD_ID}", "-f apps/permissions/external1-service/Dockerfile .")
                    docker.withRegistry("https://${DOCKER_REGISTRY}", 'docker-registry-credentials') {
                        image.push()
                        image.push('latest')
                    }
                }
            }
        }

        stage('Build & Push external2-service') {
            steps {
                script {
                    def image = docker.build("${DOCKER_REGISTRY}/external2-service:${env.BUILD_ID}", "-f apps/permissions/external2-service/Dockerfile .")
                    docker.withRegistry("https://${DOCKER_REGISTRY}", 'docker-registry-credentials') {
                        image.push()
                        image.push('latest')
                    }
                }
            }
        }
    }
}
