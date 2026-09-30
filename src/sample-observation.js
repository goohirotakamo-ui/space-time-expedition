import {defaultSolar,lookAt,sub} from './solar-system.js';
import {getRecordedSampleLocation} from './sample-locations.js';

// Point the instrument at its subject, while preserving the collection position
// and clocks. Turning the ship away does not turn a Moon observation into Earth.
export function sampleObservation(record){
  const site=getRecordedSampleLocation(record);if(!site)return null;
  const s=record.sampling;
  return {...defaultSolar(s.era),modelVersion:s.modelVersion===2?2:1,colorMode:s.colorMode==='natural'?'natural':'enhanced',observationVersion:s.observationVersion,position:[...s.position],simulationDays:s.simulationDays,
    rotationDaysElapsed:s.rotationDaysElapsed??s.simulationDays,eventProgress:s.eventProgress,
    orientation:lookAt(sub(site.lookAt,s.position)),target:site.bodyId,subject:site.bodyId,
    motion:'paused',eventPlaying:false};
}
