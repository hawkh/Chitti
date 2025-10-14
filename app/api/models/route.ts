import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { ScalableModelManager } from '@/services/ai/ScalableModelManager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get('modelId');

    if (modelId) {
      // Get specific model info
      const model = await prisma.modelInfo.findUnique({
        where: { id: modelId }
      });

      if (!model) {
        return NextResponse.json({
          success: false,
          error: { message: 'Model not found', code: 'MODEL_NOT_FOUND' }
        }, { status: 404 });
      }

      const modelManager = ScalableModelManager.getInstance();
      const metrics = await modelManager.getModelMetrics(modelId);

      return NextResponse.json({
        success: true,
        data: {
          ...model,
          metrics,
          isLoaded: modelManager.getLoadedModels().includes(modelId)
        }
      });
    } else {
      // Get all models
      const models = await prisma.modelInfo.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      });

      const modelManager = ScalableModelManager.getInstance();
      const loadedModels = modelManager.getLoadedModels();

      return NextResponse.json({
        success: true,
        data: {
          models: models.map(model => ({
            ...model,
            isLoaded: loadedModels.includes(model.id)
          })),
          loadedCount: loadedModels.length,
          totalCount: models.length
        }
      });
    }
  } catch (error) {
    console.error('Get models error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to get models',
        code: 'GET_MODELS_ERROR'
      }
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      version,
      description,
      modelPath,
      weightsPath,
      configPath,
      inputSize,
      classNames,
      accuracy
    } = body;

    // Validate required fields
    if (!name || !version || !modelPath || !configPath) {
      return NextResponse.json({
        success: false,
        error: { message: 'Missing required fields', code: 'MISSING_FIELDS' }
      }, { status: 400 });
    }

    // Create model record
    const model = await prisma.modelInfo.create({
      data: {
        name,
        version,
        description,
        modelPath,
        weightsPath,
        configPath,
        inputSize,
        classNames,
        accuracy
      }
    });

    return NextResponse.json({
      success: true,
      data: model,
      message: 'Model registered successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Create model error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to register model',
        code: 'CREATE_MODEL_ERROR'
      }
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get('modelId');
    const action = searchParams.get('action');

    if (!modelId) {
      return NextResponse.json({
        success: false,
        error: { message: 'Model ID required', code: 'MISSING_MODEL_ID' }
      }, { status: 400 });
    }

    const modelManager = ScalableModelManager.getInstance();

    if (action === 'load') {
      // Load model into memory
      const result = await modelManager.loadModel(modelId);
      
      if (!result.success) {
        return NextResponse.json({
          success: false,
          error: { message: result.error, code: 'MODEL_LOAD_ERROR' }
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Model loaded successfully'
      });

    } else if (action === 'unload') {
      // Unload model from memory
      await modelManager.unloadModel(modelId);
      
      return NextResponse.json({
        success: true,
        message: 'Model unloaded successfully'
      });

    } else {
      // Update model info
      const body = await request.json();
      
      const updatedModel = await prisma.modelInfo.update({
        where: { id: modelId },
        data: body
      });

      return NextResponse.json({
        success: true,
        data: updatedModel,
        message: 'Model updated successfully'
      });
    }

  } catch (error) {
    console.error('Update model error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to update model',
        code: 'UPDATE_MODEL_ERROR'
      }
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get('modelId');

    if (!modelId) {
      return NextResponse.json({
        success: false,
        error: { message: 'Model ID required', code: 'MISSING_MODEL_ID' }
      }, { status: 400 });
    }

    // Unload model if loaded
    const modelManager = ScalableModelManager.getInstance();
    await modelManager.unloadModel(modelId);

    // Soft delete - mark as inactive
    await prisma.modelInfo.update({
      where: { id: modelId },
      data: { isActive: false }
    });

    return NextResponse.json({
      success: true,
      message: 'Model deleted successfully'
    });

  } catch (error) {
    console.error('Delete model error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to delete model',
        code: 'DELETE_MODEL_ERROR'
      }
    }, { status: 500 });
  }
}