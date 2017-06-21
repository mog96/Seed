'use strict';

var quizApp = angular.module('quizApp', ['ngRoute']);

var url = window.location.href;
var oid = url.substring(url.length - 24, url.length); // FIXME

quizApp.config(['$routeProvider',
  function ($routeProvider) {
    $routeProvider.
    when('/', {
      templateUrl: '/static/quiz/start.html',
      controller: 'QuizController'
    }).
    when('/:index', {
      templateUrl: '../../static/quiz/quiz-view.html',
      controller: 'QuizController'
    }).
    when('/results', {
      templateUrl: '../../static/quiz/results.html',
      controller: 'QuizController'
    }).
    otherwise({
      redirectTo: '/error'
    });
  }]);

quizApp.service("dataModel", function() {
  this.correct = 0;
})

quizApp.controller('QuizController', ['$scope', '$window', 'dataModel', '$interval',
  function ($scope, $window, dataModel, $interval) {
    $scope.quiz = {};
    $scope.quiz.pages = [
      // Question 1
      {
        "questions": [
          {
            "question": "What is the benefit for the employer of high effort?",
            "answers": [
              "0 points",
              "5 points",
              "10 points",
              "20 points",
              "30 points",
              "40 points"
            ]
          }
        ]
      },
      // Question 2
      {
        "questions": [
          {
            "question": "What happens after the worker rejects a contract?",
            "answers": [
              "The employer can offer a contract to someone else.",
              "The worker and the employer do not earn anything.",
              "The worker earns 10 additional points, but the employer does not get any additional points."
            ]
          }
        ]
      },
      // Question 3
      {
        "background": "Suppose the employer offers a contract of 20 points. The worker accepts and chooses low effort.",
        "questions": [
          {
            "question": "What are the employer’s final earnings?",
            "answers": [
              "0 points",
              "10 points",
              "15 points",
              "20 points",
              "25 points",
              "50 points"
            ]
          },
          {
            "question": "What are the worker’s final earnings?",
            "answers": [
              "0 points",
              "10 points",
              "15 points",
              "20 points",
              "25 points",
              "50 points"
            ]
          }
        ]
      },
      // Question 4
      {
        "background": "Suppose the employer offers a contract of 10 points. The worker accepts and chooses high effort.",
        "questions": [
          {
            "question": "What are the employer’s final earnings?",
            "answers": [
              "0 points",
              "10 points",
              "15 points",
              "20 points",
              "25 points",
              "50 points"
            ]
          },
          {
            "question": "What are the worker’s final earnings?",
            "answers": [
              "0 points",
              "10 points",
              "15 points",
              "20 points",
              "25 points",
              "50 points"
            ]
          }
        ]
      }
    ];
    $scope.quiz.solutions = [[5], [2], [1, 4], [5, 2]];  // Indices of correct answers, ordered by question number.
    $scope.quiz.continue = false;
    $scope.quiz.mistake = false;

    $scope.quiz.newPage = function(page){
      $window.location.assign("/quiz/user/" + oid + "#/" + page);
      $scope.quiz.continue = false;
      $scope.quiz.mistake = false;
    }

    $scope.quiz.begin = function() {
      $scope.quiz.newPage('0');
    }

    $scope.quiz.validate = function(question) {
      if ($scope.quiz.answers[question] === $scope.quiz.inputs[question]) {
        if (!$scope.quiz.mistake) {
          dataModel.correct++;
        }
        $scope.quiz.newPage(question + 1);
      }
      else {
        $scope.quiz.mistake = true;    
      }
    }

    $scope.quiz.numCorrect = function() {
      return dataModel.correct;
    }

    $scope.quiz.pass = function() {
      return dataModel.correct >= 2;
    }

    $scope.quiz.finish = function() {
      $window.location.assign("/instructionsemployer?oid=" + oid);
    }

    $scope.quiz.timeUp = false;
    $scope.quiz.counter = 30;

    var stop;
    $scope.quiz.countdown = function(){
      if ( angular.isDefined(stop) ) return;

      stop = $interval(function() {
        if ($scope.quiz.counter > 0) {
          $scope.quiz.counter--;
        } else {
          $scope.quiz.timerStop();
        }
      }, 1000); 
    };
    $scope.quiz.countdown();

    $scope.quiz.timerStop = function() {
      $scope.quiz.timeUp = true;
      if (angular.isDefined(stop)) {
        $interval.cancel(stop);
        stop = undefined;
      }
    };

    $scope.$on('$destroy', function() {
      // Make sure that the interval is destroyed too.
      $scope.quiz.timerStop();
    });
  }]);

