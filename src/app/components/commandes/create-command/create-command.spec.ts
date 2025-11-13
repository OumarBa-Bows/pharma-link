import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCommand } from './create-command';

describe('CreateCommand', () => {
  let component: CreateCommand;
  let fixture: ComponentFixture<CreateCommand>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCommand]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateCommand);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
