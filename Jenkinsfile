node {
    def packages = ['backend', 'management-client', 'microfrontends', 'example-app', 'example-app-angular']

    try {
        stage('Checkout') {
            checkout scm
        }

        stage('Install') {
            sh 'npm install'
        }

        stage('Lint') {
            sh 'npm run --workspaces lint --if-present || true'
        }

        stage('Test') {
            sh 'npm run --workspaces test --if-present'
        }

        stage('Build') {
            sh 'npm run --workspaces build --if-present'
        }

        if (env.BRANCH_NAME == 'main') {
            stage('Docker Build & Push') {
                withCredentials([usernamePassword(credentialsId: 'docker-registry-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    def registryUrl = env.DOCKER_REGISTRY ?: 'docker.io'

                    sh "echo \$DOCKER_PASS | docker login ${registryUrl} -u \$DOCKER_USER --password-stdin"

                    def commitHash = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()

                    for (pkg in packages) {
                        def imageName = "${registryUrl}/${pkg}"
                        echo "Building and pushing ${imageName}..."

                        sh "docker build -t ${imageName}:${commitHash} -t ${imageName}:latest -f packages/${pkg}/Dockerfile ."
                        sh "docker push ${imageName}:${commitHash}"
                        sh "docker push ${imageName}:latest"
                    }
                }
            }
        }
    } catch (e) {
        currentBuild.result = 'FAILURE'
        throw e
    } finally {
        stage('Cleanup') {
            cleanWs()
        }
    }
}
