import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import { Router } from '@angular/router';
import { encode } from 'punycode';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  username: HTMLInputElement;
  password: HTMLInputElement;

  constructor(private route: Router) {}

  ngOnInit(): void {}

  test() {
    $('#login').css('display', 'none');
    $('#log-in').css('display', 'block');
    this.username = document.getElementById('username') as HTMLInputElement;
    this.password = document.getElementById('pwd') as HTMLInputElement;
    if (this.username.value == '' || this.password.value == '') {
      document.getElementById('warning').innerHTML =
        '<b> <h2>' + 'Login Id and password field are required' + '</h2></b>';
      $('#login').css('display', 'block');
      $('#log-in').css('display', 'none');
    } else if (this.username && this.password) {
      localStorage.setItem(this.username.value, this.password.value);
      if(/^\d+$/.test(this.username.value) == true){
        this.login();
      }    
      else if(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(this.username.value)){
        this.assessor_login();
      }
      else{
        window.alert("Opps!!!");
      }
    }
  }
  login() {
    $.ajax({
      url: environment.URL_authentication,
      type: 'POST',
      dataType: 'json',
      data: {
        apiKey: environment.api_key,
        RegistrationId: this.username.value,
        password: localStorage.getItem(this.username.value),
      },
      success: (data) => {
        var json = JSON.parse(JSON.stringify(data));
        localStorage.setItem(
          json.CandidateAssessmentAuthentication.AssessmentRequestId +
            '_' +
            json.CandidateAssessmentAuthentication.CandidateId,
          JSON.stringify(data)
        );
        if (json.CandidateAssessmentAuthentication.Message == 'SUCCESS') {
          const monthNames = [
            'Jan',
            'Feb',
            'March',
            'April',
            'May',
            'June',
            'July',
            'Aug',
            'Sept',
            'Oct',
            'Nov',
            'Dec',
          ];
          let dateObj = new Date();
          let month = monthNames[dateObj.getMonth()];
          let day = String(dateObj.getDate()).padStart(2, '0');
          let year = dateObj.getFullYear();
          let output = (30 + '-' + 'Sep' + '-' + 2020) as string;
          if (
            output == json.CandidateAssessmentAuthentication.ScheduledStartDate
          ) {
            $.ajax({
              url: environment.URL_datarequest,
              type: 'POST',
              dataType: 'json',
              data: {
                apiKey: environment.api_key,
                RegistrationId: this.username.value,
                password: this.password.value,
              },
              success: (data) => {
                if (
                  localStorage.getItem('req_id') &&
                  localStorage.getItem('cand_id')
                ) {
                  var req = localStorage.getItem('req_id');
                  var cand = localStorage.getItem('cand_id');
                  if (localStorage.getItem(req + '_' + cand + '_data')) {
                    var data = JSON.parse(
                      localStorage.getItem(req + '_' + cand + '_data')
                    );
                    if (localStorage.getItem('Response_data')) {
                      data = JSON.parse(localStorage.getItem('Response_data'));
                    }
                    if (localStorage.getItem('assessment') == 'theory') {
                      if (
                        data.CandidateAssessmentData.TheoryAssessment.StartImage
                          .FileName == '' ||
                        data.CandidateAssessmentData.TheoryAssessment
                          .IdentityImage.FileName == ''
                      )
                        this.route.navigate(['image-capture']);
                      else if (
                        data.CandidateAssessmentData.TheoryAssessment.StartImage
                          .FileName != '' &&
                        data.CandidateAssessmentData.TheoryAssessment
                          .IdentityImage.FileName != '' &&
                        data.CandidateAssessmentData.TheoryAssessment
                          .AssessmentStatus == '0'
                      ) {
                        this.route.navigate(['theory-instructions']);
                      } else if (
                        data.CandidateAssessmentData.TheoryAssessment
                          .AssessmentStatus == '1'
                      ) {
                        let element = document.documentElement;
                        if (element.requestFullscreen)
                          element.requestFullscreen();
                        this.route.navigate(['theory-assessment']);
                      } else if (
                        data.CandidateAssessmentData.TheoryAssessment
                          .AssessmentStatus == '2' &&
                        data.CandidateAssessmentData.TheoryAssessment.EndImage
                          .FileName == ''
                      )
                        this.route.navigate(['end-image-capture']);
                      else if (
                        data.CandidateAssessmentData.TheoryAssessment.EndImage
                          .FileName != '' &&
                        data.CandidateAssessmentData.TheoryAssessment
                          .AssessmentStatus == '2'
                      )
                        this.route.navigate(['feedback-theory']);
                      else if (
                        data.CandidateAssessmentData.TheoryAssessment
                          .AssessmentStatus == '3'
                      )
                        this.route.navigate(['submit-response']);
                      else if (
                        data.CandidateAssessmentData.TheoryAssessment
                          .AssessmentStatus == '4' &&
                        data.CandidateAssessmentData.PracticalAssessment
                          .AssessmentStatus != '4'
                      )
                        this.route.navigate(['assessment-details']);
                      else if (
                        data.CandidateAssessmentData.TheoryAssessment
                          .AssessmentStatus == '4' &&
                        data.CandidateAssessmentData.PracticalAssessment
                          .AssessmentStatus == '4'
                      ) {
                        document.getElementById(
                          'warning'
                        ).style.backgroundColor = 'lawngreen';
                        document.getElementById('warning').innerHTML =
                          '<b> <h2>' +
                          'You have completed the assessment' +
                          '</h2></b>';
                        $('#login').css('display', 'block');
                        $('#log-in').css('display', 'none');
                      }
                    } else if (
                      localStorage.getItem('assessment') == 'practical'
                    ) {
                      if (
                        data.CandidateAssessmentData.PracticalAssessment
                          .StartImage.FileName == '' ||
                        data.CandidateAssessmentData.PracticalAssessment
                          .IdentityImage.FileName == ''
                      )
                        this.route.navigate(['image-capture']);
                      else if (
                        data.CandidateAssessmentData.PracticalAssessment
                          .StartImage.FileName != '' &&
                        data.CandidateAssessmentData.PracticalAssessment
                          .IdentityImage.FileName != '' &&
                        data.CandidateAssessmentData.PracticalAssessment
                          .AssessmentStatus == '0'
                      ) {
                        this.route.navigate(['practical-instructions']);
                      } else if (
                        data.CandidateAssessmentData.PracticalAssessment
                          .AssessmentStatus == '1'
                      ) {
                        let element = document.documentElement;
                        if (element.requestFullscreen)
                          element.requestFullscreen();
                        this.route.navigate(['practical-assessment']);
                      } else if (
                        data.CandidateAssessmentData.PracticalAssessment
                          .AssessmentStatus == '2' &&
                        data.CandidateAssessmentData.PracticalAssessment
                          .EndImage.FileName == ''
                      )
                        this.route.navigate(['end-image-capture']);
                      else if (
                        data.CandidateAssessmentData.PracticalAssessment
                          .EndImage.FileName != '' &&
                        data.CandidateAssessmentData.PracticalAssessment
                          .AssessmentStatus == '2'
                      )
                        this.route.navigate(['feedback-practical']);
                      else if (
                        data.CandidateAssessmentData.PracticalAssessment
                          .AssessmentStatus == '3'
                      )
                        this.route.navigate(['submit-response']);
                      else if (
                        data.CandidateAssessmentData.TheoryAssessment
                          .AssessmentStatus != '4' &&
                        data.CandidateAssessmentData.PracticalAssessment
                          .AssessmentStatus == '4'
                      )
                        this.route.navigate(['assessment-details']);
                      else if (
                        data.CandidateAssessmentData.TheoryAssessment
                          .AssessmentStatus == '4' &&
                        data.CandidateAssessmentData.PracticalAssessment
                          .AssessmentStatus == '4'
                      ) {
                        document.getElementById(
                          'warning'
                        ).style.backgroundColor = 'lawngreen';
                        document.getElementById('warning').innerHTML =
                          '<b> <h2>' +
                          'You have completed the assessment' +
                          '</h2></b>';
                        $('#login').css('display', 'block');
                        $('#log-in').css('display', 'none');
                      }
                    } else this.route.navigate(['assessment-details']);
                  }
                } else {
                  var datas = JSON.parse(JSON.stringify(data));
                  datas.CandidateAssessmentData.TheoryAssessment.AssessmentStatus = 0;
                  datas.CandidateAssessmentData.PracticalAssessment.AssessmentStatus = 0;
                  localStorage.setItem(
                    'req_id',
                    datas.CandidateAssessmentData.AssessmentRequestId
                  );
                  localStorage.setItem(
                    'cand_id',
                    datas.CandidateAssessmentData.CandidateId
                  );
                  localStorage.setItem(
                    datas.CandidateAssessmentData.AssessmentRequestId +
                      '_' +
                      datas.CandidateAssessmentData.CandidateId +
                      '_' +
                      'data',
                    JSON.stringify(datas)
                  );
                  this.route.navigate(['general-instructions']);
                }
              },
              error: function (err) {
                console.log('error:' + err);
              },
            });
          } else {
            document.getElementById('warning').innerHTML =
              '<b><h2>' +
              'No assessment has been scheduled for you today! Please contact the system administrator for assistance' +
              '</h2></b>';
            $('#login').css('display', 'block');
            $('#log-in').css('display', 'none');
          }
        } else {
            document.getElementById('warning').innerHTML =
            '<b><h2>' +
            json.CandidateAssessmentAuthentication.Message +
            '</h2></b>';
          $('#login').css('display', 'block');
          $('#log-in').css('display', 'none');
        }
      },
      error: function (err) {
        console.log('error:' + err);
        $('#login').css('display', 'block');
        $('#log-in').css('display', 'none');
      },
    });
  }
  assessor_login(){
    $.ajax({
      url: environment.URL_authentication_email,
      type: 'POST',
      dataType: 'json',
      data: {
        ApiKey : environment.ApiKey,
        LoginId: this.username.value,
        password: this.password.value,
        ClientIpAddress : environment.ClientIP,
        ClientBrowser : environment.ClientBrowser,
      },
      success: (data) => {
        var json = JSON.parse(JSON.stringify(data));
        localStorage.setItem(json.AuthenticationResponseData.UserId, JSON.stringify(data));
        localStorage.setItem("USerId",json.AuthenticationResponseData.UserId);
        sessionStorage.setItem("SessionId",json.AuthenticationResponseData.SessionId);

        if (json.AuthenticationResponseData.Message == 'User authentication success')
        {
            this.route.navigate(['home']);
        }else {
          document.getElementById('warning').innerHTML =
          '<b><h2>' +
          json.AuthenticationResponseData.Message +
          '</h2></b>';
        $('#login').css('display', 'block');
        $('#log-in').css('display', 'none');}
      },
      error: function (err) {
        console.log('error:' + err);
        $('#login').css('display', 'block');
        $('#log-in').css('display', 'none');
      },
    });
  }
}
