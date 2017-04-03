class User < ActiveRecord::Base 
  has_many :heroes
  has_many :monsters
  has_many :games

  validates :user_name, presence: true
  validates :email, uniqueness: true
  validates :password_hash, presence: true

  def password
    @password ||= Password.new(hashed_password)
  end

  def password=(new_password)
    @password = Password.create(new_password)
    self.hashed_password = @password
  end

  def authenticate(input_email, input_password)
    self.email == input_email && self.password == input_password
  end

end
