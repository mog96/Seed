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
    when('/page/:pageIndex', {
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

quizApp.controller('QuizController', ['$scope', '$window', '$interval', '$routeParams',
  function ($scope, $window, $interval, $routeParams) {
    $scope.quiz = {};
    $scope.quiz.pages = [
      // Page 1
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
      // Page 2
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
      // Page 3
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
      // Page 4
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
    $scope.quiz.numQuestions = 0;
    var i;
    for (i = 0; i < $scope.quiz.pages.length; i++) {
      var j;
      for (j = 0; j < $scope.quiz.pages[i].questions.length; j++) {
        $scope.quiz.numQuestions += 1;
      }
    }
    $scope.quiz.solutions = [[5], [2], [1, 4], [5, 2]];  // Indices of correct answers, ordered by quiz page/question number.
    $scope.quiz.attemptsPerQuestion = [];
    $scope.quiz.selectedAnswers = [];
    $scope.quiz.continue = false;
    $scope.quiz.mistake = false;
    $scope.quiz.pageIndex = $routeParams.pageIndex;

    $scope.quiz.newPage = function(page) {
      if (Number(page) === $scope.quiz.pages.length) {
        $window.location.assign("/quiz/user/" + oid + "#/results");
      } else {
        $window.location.assign("/quiz/user/" + oid + "#/page/" + page);  // TODO: '#' necessary?
      }
      $scope.quiz.continue = false;
      $scope.quiz.mistake = false;
      $scope.quiz.pageIndex = $routeParams.pageIndex;
    }

    $scope.quiz.begin = function() {
      $scope.quiz.newPage('0');
    }

    $scope.quiz.validate = function() {
      var pageSolns = $scope.quiz.solutions[$scope.quiz.pageIndex];
      var i;
      for (i = 0; i < pageSolns.length; i++) {
        if (pageSolns[i] != $scope.quiz.selectedAnswers[i]) {
          $scope.quiz.mistake = true;
          return;
        } else {
          if ($scope.quiz.attemptsPerQuestion[$scope.quiz.pageIndex]) {
            $scope.quiz.attemptsPerQuestion[$scope.quiz.pageIndex][i] += 1;
          } else {
            $scope.quiz.attemptsPerQuestion[$scope.quiz.pageIndex] = [1];
          }
        }
      }
      $scope.quiz.newPage(Number($scope.quiz.pageIndex) + 1);
    }

    $scope.quiz.numCorrect = function() {
      var singleAttempts = 0;
      for (var i = 0; i < $scope.quiz.attemptsPerQuestion.length; i++) {
        for (var j = 0; j < $scope.quiz.attemptsPerQuestion[i].length; j++) {
          if ($scope.quiz.attemptsPerQuestion[i][j] === 1) {
            singleAttempts += 1;
          }
        }
      }
      console.log("SINGLE ATTEMPTS", singleAttempts);
      return singleAttempts;
    }

    $scope.quiz.pass = function() {
      var score = Number($scope.quiz.numCorrect) / Number($scope.quiz.numQuestions);
      console.log(score);
      return score > 0.66;
    }

    $scope.quiz.finish = function() {
      $window.location.assign("/instructionsemployer?oid=" + oid);
    }

    $scope.quiz.timeUp = false;
    $scope.quiz.counter = 30;

    var stop;
    $scope.quiz.countdown = function() {
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

