/* Voice capture never submits chat or saves finance records. */
(()=>{
 'use strict';
 window.PesoAssistantVoice={create(config){
  let generation=0,recognizer=null,recorder=null,stream=null,timer=null,aborter=null,phase='idle';
  const input=()=>config.getInput(),state=next=>{phase=next;config.onState(next);};
  const stopTracks=()=>{stream?.getTracks().forEach(t=>t.stop());stream=null;clearTimeout(timer);timer=null;};
  function cancel(){generation++;try{recognizer?.abort();}catch{}recognizer=null;aborter?.abort();aborter=null;if(recorder?.state==='recording')recorder.stop();recorder=null;stopTracks();state('idle');config.setStatus('');}
  const describeError=code=>({'not-allowed':'Microphone permission is blocked. Allow Microphone in this site’s browser settings, then try again.','service-not-allowed':'Your browser’s speech service is unavailable. Try AI recording with your connected provider.','network':'Your browser could not reach its speech service. Try AI recording below, or check your connection.','audio-capture':'No working microphone was found. Check your input device and close apps that may be using it.','no-speech':'No speech was detected. Try again and speak closer to your microphone.','language-not-supported':'This speech language is unavailable. Change the voice language in AI settings.',NotAllowedError:'Microphone permission is blocked. Allow Microphone for this site and in your system privacy settings.',NotFoundError:'No microphone was found. Connect a microphone or choose another input device.',NotReadableError:'The microphone is busy or unavailable. Check your system input device and try again.',SecurityError:'Microphone access is restricted here. Open PESOBASE directly in a secure browser tab.'}[code]||'The microphone could not start. Check your browser and system microphone permissions.');
  function startBrowser(){
   cancel();config.setError('');const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;if(!Speech){config.setError('Browser dictation is unavailable. Connect Gemini or Groq and use AI recording, or type your message.');return;}
   const ticket=generation,scope=config.getScope(),base=input().trim();let final='',interim='';const r=new Speech();recognizer=r;r.lang=config.getLanguage()||'en-US';r.continuous=true;r.interimResults=true;r.maxAlternatives=1;
   const current=()=>ticket===generation&&scope===config.getScope()&&recognizer===r;
   const finish=()=>{if(!current())return;recognizer=null;clearTimeout(timer);timer=null;state('idle');config.setStatus(final||interim?'Transcript ready. Review it, then press Send.':'');};
   r.onstart=()=>{if(!current()){r.abort();return;}state('listening');config.setStatus('Listening… tap the microphone to finish.');};
   r.onresult=event=>{if(!current())return;final='';interim='';for(let i=0;i<event.results.length;i++){const text=event.results[i][0]?.transcript||'';if(event.results[i].isFinal)final+=text+' ';else interim+=text+' ';}config.setInput([base,final.trim(),interim.trim()].filter(Boolean).join(' ').slice(0,4000));};
   r.onerror=event=>{if(!current()||event.error==='aborted')return;config.setError(describeError(event.error));finish();try{r.abort();}catch{};};r.onend=finish;
   try{state('starting');config.setStatus('Starting microphone…');r.start();timer=setTimeout(()=>{if(current()){try{r.stop();}catch{finish();}setTimeout(finish,1500);}},60000);}catch(e){config.setError(describeError(e.name));finish();}
  }
  async function startRecording(){
   cancel();config.setError('');if(!config.canRecord()){config.setError('Connect Gemini or Groq to use AI recording. Browser dictation can work without a key.');return;}
   if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){config.setError('AI recording is unavailable here. Open PESOBASE directly over HTTPS in a current browser.');return;}
   const ticket=generation,scope=config.getScope(),current=()=>ticket===generation&&scope===config.getScope();state('starting');config.setStatus('Allow microphone access to start recording.');
   try{
    const audio=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:false});if(!current()){audio.getTracks().forEach(t=>t.stop());return;}stream=audio;
    const mime=['audio/webm;codecs=opus','audio/mp4','audio/ogg;codecs=opus','audio/webm'].find(type=>MediaRecorder.isTypeSupported(type));const r=new MediaRecorder(audio,{...(mime?{mimeType:mime}:{}),audioBitsPerSecond:64000});recorder=r;let chunks=[],bytes=0;
    r.ondataavailable=event=>{if(current()&&event.data?.size){bytes+=event.data.size;chunks.push(event.data);if(bytes>2000000){cancel();config.setError('The recording is too large. Try a shorter clip.');}}};r.onerror=()=>{if(current()){cancel();config.setError('Recording failed. Check your input device and try again.');}};
    r.onstop=async()=>{
     if(!current())return;stopTracks();recorder=null;const mimeType=(r.mimeType||mime||'audio/webm').split(';')[0],blob=new Blob(chunks,{type:mimeType});chunks=[];
     if(blob.size<32){state('idle');config.setStatus('');config.setError('The recording was empty. Try again.');return;}
     state('transcribing');config.setStatus('Transcribing with '+config.getProvider()+'…');aborter=new AbortController();const active=aborter,timeout=setTimeout(()=>active.abort(),55000);
     try{const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=reject;reader.readAsDataURL(blob);});if(!current())return;const result=await config.transcribe({data,mimeType},active.signal);if(!current())return;config.setInput([input().trim(),result.text.trim()].filter(Boolean).join(' ').slice(0,4000));config.setStatus('Transcript ready. Review it, then press Send.');}
     catch(e){if(current()){config.setStatus('');config.setError(active.signal.aborted?'Transcription timed out. Try a shorter recording.':e.message||'Could not transcribe this recording.');}}
     finally{clearTimeout(timeout);if(current()){aborter=null;state('idle');}}
    };
    r.start(1000);state('recording');config.setStatus('Recording · up to 60 seconds. Tap the microphone to transcribe.');timer=setTimeout(()=>{if(current()&&r.state==='recording')r.stop();},60000);
   }catch(e){if(current()){stopTracks();state('idle');config.setStatus('');config.setError(describeError(e.name));}}
  }
  function finish(){if(phase==='recording'){recorder?.stop();return;}if(recognizer){try{recognizer.stop();}catch{cancel();}const ticket=generation;setTimeout(()=>{if(ticket===generation&&phase!=='idle'){recognizer=null;state('idle');config.setStatus('Transcript ready. Review it, then press Send.');}},1500);}else cancel();}
  return {startBrowser,startRecording,cancel,finish,get phase(){return phase;},get busy(){return phase!=='idle';}};
 }};
})();
