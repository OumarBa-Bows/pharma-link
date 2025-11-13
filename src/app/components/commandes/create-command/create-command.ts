import { Component } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Command} from "../../../model/command";

@Component({
  selector: 'app-create-command',
  imports: [],
  templateUrl: './create-command.html',
  standalone: true,
  styleUrl: './create-command.scss'
})
export class CreateCommand {

  commandForm!: FormGroup;


  constructor(private fb: FormBuilder) {}

  onSubmit() {
    if (this.commandForm.invalid) {
      this.commandForm.markAllAsTouched();
      return;
    }

    const command: Command = {
      ...this.commandForm.value,
      id: 0, // généré côté backend
      distributor: null!,
      mainDistributor: null!,
      pharmacy: null!,
      details: [],
    } as Command;

    console.log('Commande créée :', command);
    alert('Commande créée avec succès !');
  }
}
