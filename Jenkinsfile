pipeline {
    agent any

    environment {
        NODE_ENV = 'production'
    }

    stages {
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Restart App') {
            steps {
                sh '''
                pm2 delete expense-tracker || true
                pm2 start app.js --name expense-tracker
                pm2 save
                '''
            }
        }
    }
}
