class Player:
	id = None
	name = None
	color = None
	is_ready = False
	is_admin = False
	current_game = None

	def __init__(self, id, name, color, is_ready=False, is_admin=False):
		self.id = id
		self.name = name
		self.color = color
		self.is_ready = is_ready
		self.is_admin = is_admin

	def toggle_ready(self):
		self.is_ready = not self.is_ready
	

	def convert_to_obj(self):
		return {
			"id": self.id,
			"name": self.name,
			"color": self.color,
			"ready": self.is_ready,
			"admin": self.is_admin, 
		}
	
	def __eq__(self, other):
		if not isinstance(other, Player):
			return NotImplemented
		
		return self.id == other.id
	