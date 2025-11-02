import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandDetail } from './command-detail';

describe('CommandDetail', () => {
  let component: CommandDetail;
  let fixture: ComponentFixture<CommandDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommandDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
