


    const recordAudio = () =>
        new Promise(async resolve => {
            try{
                let stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                let mediaRecorder = new MediaRecorder(stream);
                let audioChunks = [];

                mediaRecorder.addEventListener('dataavailable', event => {
                    audioChunks.push(event.data);
                });

                const start = () => {
                    audioChunks = [];
                    mediaRecorder.start();
                };

                const stop = () =>
                    new Promise(resolve => {
                        mediaRecorder.addEventListener('stop', (e) => {
                            if(audioChunks.length){
                                const audioBlob = new Blob(audioChunks,{type : 'audio/ogg'});
                                audioChunks = [];
                                const audioUrl = URL.createObjectURL(audioBlob);
                                let audio = new Audio(audioUrl);
                                audio.setAttribute('controls','controls');
                                console.log('stop')

                                savedAudioMessagesContainer.appendChild(audio);

                                const play = () => audio.play();
                                resolve({ audioChunks, audioBlob, audioUrl, play });
                            }
                        });

                        mediaRecorder.stop();
                    });

                resolve({ start, stop });
            }catch(e){
                console.error('error not connected microphone');
                console.error(e);
            }

        });


    const sleep = time => new Promise(resolve => setTimeout(resolve, time));

    const recordButton = document.querySelector('#record');
    const stopButton = document.querySelector('#stop');
    const playButton = document.querySelector('#play');
    const saveButton = document.querySelector('#save');
    const savedAudioMessagesContainer = document.querySelector('#saved-audio-messages');

    let recorder;
    let audio;

    recordButton.addEventListener('click', async () => {
        recordButton.setAttribute('disabled', true);
        stopButton.removeAttribute('disabled');
        playButton.setAttribute('disabled', true);
        saveButton.setAttribute('disabled', true);
        if (!recorder) {
            console.log("!recorder");
            recorder = await recordAudio();
        }
        recorder.start();
    });

    stopButton.addEventListener('click', async () => {
        recordButton.removeAttribute('disabled');
        stopButton.setAttribute('disabled', true);
        playButton.removeAttribute('disabled');
        saveButton.removeAttribute('disabled');
        audio = await recorder.stop();

    });

    playButton.addEventListener('click', () => {
        audio.play();
    });

// saveButton.addEventListener('click', () => {
//     const reader = new FileReader();
//     reader.readAsDataURL(audio.audioBlob);
//     reader.onload = () => {
//         const base64AudioMessage = reader.result.split(',')[1];
//
//         fetch('/messages', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ message: base64AudioMessage })
//         }).then(res => {
//             if (res.status === 201) {
//                 return populateAudioMessages();
//             }
//             console.log('Invalid status saving audio message: ' + res.status);
//         });
//     };
// });

// const populateAudioMessages = () => {
//     return fetch('/messages').then(res => {
//         if (res.status === 200) {
//             return res.json().then(json => {
//                 json.messageFilenames.forEach(filename => {
//                     let audioElement = document.querySelector(`[data-audio-filename="${filename}"]`);
//                     if (!audioElement) {
//                         audioElement = document.createElement('audio');
//                         audioElement.src = `/messages/${filename}`;
//                         audioElement.setAttribute('data-audio-filename', filename);
//                         audioElement.setAttribute('controls', true);
//                         savedAudioMessagesContainer.appendChild(audioElement);
//                     }
//                 });
//             });
//         }
//         console.log('Invalid status getting messages: ' + res.status);
//     });
// };

// populateAudioMessages();
