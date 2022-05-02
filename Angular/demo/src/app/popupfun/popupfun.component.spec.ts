import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupfunComponent } from './popupfun.component';

describe('PopupfunComponent', () => {
  let component: PopupfunComponent;
  let fixture: ComponentFixture<PopupfunComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupfunComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupfunComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
