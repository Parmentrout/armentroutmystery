const answer1 = new SlotMachine(document.querySelector('#clue1'), {
    active: 0,
    auto: false
  });
  const answer2 = new SlotMachine(document.querySelector('#clue2'), {
    active: 0,
    auto: false
  });
  const answer3 = new SlotMachine(document.querySelector('#clue3'), {
    active: 0,
    auto: false
  });
  const answer4 = new SlotMachine(document.querySelector('#clue4'), {
    active: 0,
    auto: false
  });
  const answer5 = new SlotMachine(document.querySelector('#clue5'), {
    active: 0,
    auto: false
  });
  const answer6 = new SlotMachine(document.querySelector('#clue6'), {
    active: 0,
    auto: false
  });
  const answer7 = new SlotMachine(document.querySelector('#clue6'), {
    active: 0,
    auto: false
  });
  const answer8 = new SlotMachine(document.querySelector('#clue6'), {
    active: 0,
    auto: false
  });

AWS.config.region = 'us-east-1';
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: 'us-east-1:687b1ef2-20a7-4a7b-908a-e23815ac0c87'
})
const lambda = new AWS.Lambda({apiVersion: '2015-03-31'});
   
const params = {
  TableName: "mystery-results",
  Item: event
};
const sessionKey = 'lockedInMystery';
$(() => {
    hideErrors();

    let sessionData = getSessionData();
    if (!sessionData) {
      $('#sessionSubmit').click((event) => {
        const email = $('#emailInput').val();
        const company = $('#companyInput').val();
        const optInInput = $('#optInInput').prop('checked');

        sessionData = {email: email, company: company, optIn: optInInput};
        console.log(sessionData);
        saveToSession(sessionData);
        saveData('start');
        $('#emailModal').modal('hide');
      });

      $('#emailModal').modal({backdrop: 'static', keyboard: false});

    }
    $('#topbutton1').click( e => $('#morse1modal').modal());
    $('#topbutton2').click( e => $('#morse2modal').modal());
    $('#topbutton3').click( e => $('#morse3modal').modal());

    function hideErrors() {

    }

    function saveData(event) {
        const payload = `{
          "email": "${sessionData.email}",
          "company": "${sessionData.company}",
          "optIn": ${sessionData.optIn},
          "eventName": "${event}",
          "time": ${Date.now()}
        }`;
        
        var params = {
          FunctionName: 'mystery-results-put', // the lambda function we are going to invoke
          InvocationType: 'RequestResponse',
          Payload: payload
        };
        lambda.invoke(params, function(err, data) {
          if (err) {
            console.error(err);
          } else {
            console.log('Mystery Put said '+ data.Payload);
            const json = JSON.parse(data.Payload);
            if (json && json.data && json.data.events) {
              let allEvents = json.data.events;
              let startTime = 0;
              let endTime = 0;
          
              for (let event of allEvents) {
                if (event.name === 'start' && startTime === 0) { // First one
                  startTime = event.time;
                }
                if (event.name === 'stop' && endTime === 0) {
                  endTime = event.time;
                }
              }
              const totalTime = endTime - startTime;
              if (totalTime > 0) {
                $('#totalTime').text(msToTime(totalTime));
              }
            }
          }
        })
      }
  
      // Session data
      function getSessionData() {
        let result = window.sessionStorage.getItem(sessionKey); 
        if (!result) { return null; }
        return JSON.parse(result);
      }
  
      function saveToSession(sessionData) {
        removeFromSession();
        window.sessionStorage.setItem(sessionKey, JSON.stringify(sessionData));
      }
  
      function removeFromSession() {
        window.sessionStorage.removeItem(sessionKey);
      }
  
      //Time function
      function msToTime(duration) {
        var milliseconds = parseInt((duration%1000)/100)
            , seconds = parseInt((duration/1000)%60)
            , minutes = parseInt((duration/(1000*60))%60)
            , hours = parseInt((duration/(1000*60*60))%24);
    
        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;
    
        return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
    }
});