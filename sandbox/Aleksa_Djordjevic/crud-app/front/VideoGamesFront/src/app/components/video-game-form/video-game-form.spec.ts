import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoGameFormComponent } from './video-game-form';

describe('VideoGameForm', () => {
  let component: VideoGameFormComponent;
  let fixture: ComponentFixture<VideoGameFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoGameFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoGameFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
