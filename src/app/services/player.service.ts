import 'rxjs/add/operator/let';
// import 'rxjs/add/operator/pluck';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/filter';

import { Action } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { AppStore } from '../models/appstore.model';
import { PlayerState } from '../reducers/player.reducer';
import { AudioStream } from '../howler-element';
import { PlayerActions } from '../actions/player.actions';
import { TrackActions } from '../actions/track.actions';

@Injectable()
export class PlayerService {

   constructor(protected audio: AudioStream, private store$: Store<AppStore>, private playerActions: PlayerActions) {
     store$.select('player')
       .map(player => player.currentTrack)
       .distinctUntilChanged()
       .subscribe(item => this.play(item.streamUrl));

     store$.select('player')
       .map(player => player.isPlaying)
       .distinctUntilChanged()
       .subscribe(item => !item ? this.pause() : this.play());

     store$.select('player')
       .map(player => player.volume)
       .distinctUntilChanged()
       .subscribe(item => this.volume(item.volume));

     Observable.fromEvent(this.audio, 'timeupdate')
       .map(item => Math.floor(item.path[0].currentTime))
       .distinctUntilChanged()
       .subscribe((item) => this.updateCurrentTime(item));

   }

   play(url: string = null): void {
     if (url) {
       this.audio.src = url;
     }
     this.audio.play();
   }

   pause(): void {
     this.audio.pause();
   }

   // takes a value from 0 - 100
   volume(volume : number): void {
     if (this.audio.src) {
       this.audio.volume(volume / 100);
     }
   }

   updateCurrentTime(time) {
     this.store$.dispatch(this.playerActions.updateCurrentTime(time));
   }

}