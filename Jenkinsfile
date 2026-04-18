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
                sh 'npx nx affected -t lint --base=origin/main --head=HEAD'
            }
        }

        stage('Prepare Tests') {
            steps {
                sh 'DATABASE_URL=postgresql://foo:bar@localhost:5432/db npx nx affected -t prisma:generate --base=origin/main --head=HEAD'
            }
        }

        stage('Test') {
            steps {
                script {
                    sh 'npx nx affected -t build --base=origin/main --head=HEAD'
                    sh 'npx nx affected -t test --base=origin/main --head=HEAD'
                }
            }
        }

        stage('Build & Push Docker Images') {
            steps {
                script {
                    def affectedAppsStr = sh(script: 'npx nx show projects --affected --with-target=docker:build --json --base=origin/main --head=HEAD', returnStdout: true).trim()
                    if (affectedAppsStr != '[]' && affectedAppsStr != '') {
                        def affectedApps = readJSON text: affectedAppsStr

                        if (affectedApps.contains('backend')) {
                            stage('Build & Push backend') {
                                def image = docker.build("${DOCKER_REGISTRY}/backend:${env.BUILD_ID}", "-f apps/microfrontends/backend/Dockerfile .")
                                docker.withRegistry("https://${DOCKER_REGISTRY}", 'docker-registry-credentials') {
                                    image.push()
                                    image.push('latest')
                                }
                            }
                        }

                        if (affectedApps.contains('management-client')) {
                            stage('Build & Push management-client') {
                                def image = docker.build("${DOCKER_REGISTRY}/management-client:${env.BUILD_ID}", "-f apps/management-client/Dockerfile .")
                                docker.withRegistry("https://${DOCKER_REGISTRY}", 'docker-registry-credentials') {
                                    image.push()
                                    image.push('latest')
                                }
                            }
                        }

                        if (affectedApps.contains('mfe-form')) {
                            stage('Build & Push mfe-form') {
                                def image = docker.build("${DOCKER_REGISTRY}/mfe-form:${env.BUILD_ID}", "-f apps/microfrontends/mfe-form/Dockerfile .")
                                docker.withRegistry("https://${DOCKER_REGISTRY}", 'docker-registry-credentials') {
                                    image.push()
                                    image.push('latest')
                                }
                            }
                        }

                        if (affectedApps.contains('mfe-list')) {
                            stage('Build & Push mfe-list') {
                                def image = docker.build("${DOCKER_REGISTRY}/mfe-list:${env.BUILD_ID}", "-f apps/microfrontends/mfe-list/Dockerfile .")
                                docker.withRegistry("https://${DOCKER_REGISTRY}", 'docker-registry-credentials') {
                                    image.push()
                                    image.push('latest')
                                }
                            }
                        }

                        if (affectedApps.contains('custom-permissions-service')) {
                            stage('Build & Push custom-permissions-service') {
                                def image = docker.build("${DOCKER_REGISTRY}/custom-permissions-service:${env.BUILD_ID}", "-f apps/permissions/custom-permissions-service/Dockerfile .")
                                docker.withRegistry("https://${DOCKER_REGISTRY}", 'docker-registry-credentials') {
                                    image.push()
                                    image.push('latest')
                                }
                            }
                        }

                        if (affectedApps.contains('permissions-orchestrator-service')) {
                            stage('Build & Push permissions-orchestrator-service') {
                                def image = docker.build("${DOCKER_REGISTRY}/permissions-orchestrator-service:${env.BUILD_ID}", "-f apps/permissions/permissions-orchestrator-service/Dockerfile .")
                                docker.withRegistry("https://${DOCKER_REGISTRY}", 'docker-registry-credentials') {
                                    image.push()
                                    image.push('latest')
                                }
                            }
                        }

                        if (affectedApps.contains('external1-service')) {
                            stage('Build & Push external1-service') {
                                def image = docker.build("${DOCKER_REGISTRY}/external1-service:${env.BUILD_ID}", "-f apps/permissions/external1-service/Dockerfile .")
                                docker.withRegistry("https://${DOCKER_REGISTRY}", 'docker-registry-credentials') {
                                    image.push()
                                    image.push('latest')
                                }
                            }
                        }

                        if (affectedApps.contains('external2-service')) {
                            stage('Build & Push external2-service') {
                                def image = docker.build("${DOCKER_REGISTRY}/external2-service:${env.BUILD_ID}", "-f apps/permissions/external2-service/Dockerfile .")
                                docker.withRegistry("https://${DOCKER_REGISTRY}", 'docker-registry-credentials') {
                                    image.push()
                                    image.push('latest')
                                }
                            }
                        }
                    } else {
                        echo "No docker apps affected, skipping build & push"
                    }
                }
            }
        }
    }
}
