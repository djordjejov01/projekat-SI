import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoGameList } from './video-game-list';

describe('VideoGameList', () => {
  let component: VideoGameList;
  let fixture: ComponentFixture<VideoGameList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoGameList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoGameList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
