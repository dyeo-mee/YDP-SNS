pipeline {
    agent any

    //깃을 3분 주기로 끌어온다
    // triggers {
    //     pollSCM('*/3 * * * *')
    // }
    stages {
        // 레포지토리를 다운로드 받음
        stage('Prepare') {
            agent any
            // 이 스텝을 통해 pull 하는 것
            steps {
                echo 'Clonning Repository'

                git url: 'https://github.com/dyeo-mee/YDP-SNS.git',
                    branch: 'testing',
                    credentialsId: 'snsMJ'
            }

            post {
                // If Maven was able to run the tests, even if some of the test
                // failed, record the test results and archive the jar file.
                success {
                    echo 'Successfully Cloned Repository'
                }

                always {
                  echo "i tried..."
                }
                // cleanup은 post가 끝났을때 진행할 내용 여기서는 로그만 찍어줬다
                cleanup {
                  echo "after all other post condition"
                }
            }
        }
        stage('Bulid Backend') {
          agent any
          steps {
            echo 'Build Backend'
            // Jenkins에서 pull한 파일을 /home/ubuntu 경로에 app 이름으로 복사
            dir (''){
                sh """
                cp -r /var/lib/jenkins/workspace/sns_project@2 /home/MJ/app
                """
            }
          }

          post {
            // 작업 실패 시 pipe line을 종료한다.
            failure {
              error 'This pipeline stops here...'
            }
          }
        }
        
    }
}  
