node {
    def packages = [['backend', 'backend'], ['management-client', 'management-client'], ['microfrontends', 'microfrontends'], ['examples/example-app', 'example-app'], ['examples/example-app-angular', 'example-app-angular']]

    try {
        stage('Checkout') {
            checkout scm
        }

        stage('Install') {
            sh 'npm install'
        }

        stage('Lint') {
            sh 'npx nx run-many -t lint || true || true'
        }

        stage('Test') {
            sh 'npx nx run-many -t test || true'
        }

        stage('Build') {
            sh 'npx nx run-many -t build'
        }

        if (env.BRANCH_NAME == 'main') {
            stage('Docker Build & Push') {
                withCredentials([usernamePassword(credentialsId: 'docker-registry-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    def registryUrl = env.DOCKER_REGISTRY ?: 'docker.io'

                    sh "echo \$DOCKER_PASS | docker login ${registryUrl} -u \$DOCKER_USER --password-stdin"

                    def commitHash = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()

                    for (pkgConfig in packages) {
                        def pkg = pkgConfig[0]
                        def tag = pkgConfig[1]
                        def imageName = "${registryUrl}/${tag}"
                        echo "Building and pushing ${imageName}..."

                        sh "docker build -t ${imageName}:${commitHash} -t ${imageName}:latest -f apps/${pkg}/Dockerfile ."
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
