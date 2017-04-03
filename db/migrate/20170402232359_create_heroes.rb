class CreateHeroes < ActiveRecord::Migration
  def change
   	create_table :heroes do |t|
  		t.integer :health
  		t.string :might
  		t.string :knowledge
  		t.string :speed

  		t.timestamps
  end
end
