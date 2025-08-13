<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateContactMetasTable extends Migration
{
    public function up()
    {
        Schema::create('contact_meta', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contact_id')->constrained()->cascadeOnDelete();
            $table->string('key');
            $table->string('value');
            $table->timestamps();

            $table->unique(['contact_id', 'key']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('contact_meta');
    }
}
