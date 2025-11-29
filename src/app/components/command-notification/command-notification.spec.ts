import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandNotification } from './command-notification';

describe('CommandNotification', () => {
  let component: CommandNotification;
  let fixture: ComponentFixture<CommandNotification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandNotification]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommandNotification);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
