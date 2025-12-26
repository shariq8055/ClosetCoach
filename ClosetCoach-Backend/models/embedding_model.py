import tensorflow as tf

# Load trained CNN
base_model = tf.keras.models.load_model("models/closetcoach_cnn.h5")

# Explicitly define input shape
input_layer = tf.keras.Input(shape=(224, 224, 3))

# Forward pass (this builds the graph)
x = base_model(input_layer)

# Extract embeddings from second-last layer
embedding_output = base_model.layers[-2].output

# Create embedding model
embedding_model = tf.keras.Model(
    inputs=base_model.inputs,
    outputs=embedding_output
)

# Save embedding model
embedding_model.save("models/embedding_model.h5")

print("✅ Embedding model created and saved successfully")
