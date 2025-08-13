<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOrganizationUserTable extends Migration
{
    public function up()
    {
        Schema::create('organization_user', function (Blueprint $table) {
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('role', ['Admin', 'Member']);
            $table->timestamps();

            $table->primary(['organization_id', 'user_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('organization_user');
    }
}
