import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Pharmacy, PharmacyState, CustomerType, Zone } from 'src/app/models/pharmacy.model';
import { ZoneService } from 'src/app/services/api/zone.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-pharmacy-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pharmacy-form.component.html',
  styleUrls: ['./pharmacy-form.component.scss']
})
export class PharmacyFormComponent implements OnInit {
  @Input() pharmacy: Partial<Pharmacy> = {};
  @Input() title = 'Add Pharmacy';
  @Input() isEditing = false;
  @Output() save = new EventEmitter<Partial<Pharmacy>>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup;
  isLoading = false;
  zones: Zone[] = [];
  
  // Make enums available in template
  PharmacyState = PharmacyState;
  CustomerType = CustomerType;
  // Arrays for *ngFor in template
  pharmacyStates = Object.values(PharmacyState);
  customerTypes = Object.values(CustomerType);

  constructor(
    private fb: FormBuilder,
    private zoneService: ZoneService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
      address: ['', Validators.required],
      email: ['', [Validators.email]],
      state: [PharmacyState.PENDING, Validators.required],
      customerType: [CustomerType.PHARMACY, Validators.required],
      zoneId: [null],
      doctorName: [''],
      managerName: [''],
      location: ['']
    });
  }

  ngOnInit(): void {
    this.loadZones();
    
    if (this.pharmacy) {
      this.form.patchValue({
        ...this.pharmacy,
        zoneId: this.pharmacy.zone?.id
      });
    }
  }

  loadZones(): void {
    this.isLoading = true;
    this.zoneService.getAll()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (zones) => {
          this.zones = zones;
        },
        error: (error) => {
          console.error('Failed to load zones', error);
        }
      });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    this.save.emit(this.form.value);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
